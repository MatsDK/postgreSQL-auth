import express, { Request, Response } from "express";
import db from "./db";
import { isAuth } from "./middleware/authMiddleware";

const router = express.Router();

interface createTaskProps {
  taskTitle: string;
  taskBody: string;
  cookie: { jid?: string };
}

interface userObj {
  id: number;
  username: string;
  email: string;
}

interface authExpressReq extends Request {
  cookie?: string;
  user?: userObj;
}

router.get("/data", async (req: Request, res: Response) => {
  try {
    const openTasks = await db.query("SELECT * FROM tasks1", []),
      takenTasks = await db.query("SELECT * FROM tasks2", []),
      doneTasks = await db.query("SELECT * FROM tasks3", []);
    res.json({
      data: {
        openTasks: openTasks.rows,
        takenTasks: takenTasks.rows,
        doneTasks: doneTasks.rows,
      },
    });
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

router.post("/data", isAuth, async (req: authExpressReq, res: Response) => {
  try {
    const resData: any = new Object();
    if (req.cookie) resData.cookie = req.cookie;

    const { taskTitle, taskBody }: createTaskProps = req.body;

    let openTasks = await db.query("SELECT * FROM tasks1 ", []),
      takenTasks = await db.query("SELECT * FROM tasks2", []),
      doneTasks = await db.query("SELECT * FROM tasks3", []);

    if (
      openTasks.rows.find(
        (x: any) => x.title.toLowerCase() === taskTitle.toLowerCase()
      ) ||
      takenTasks.rows.find(
        (x: any) => x.title.toLowerCase() === taskTitle.toLowerCase()
      ) ||
      doneTasks.rows.find(
        (x: any) => x.title.toLowerCase() === taskTitle.toLowerCase()
      )
    )
      return res.json({ err: true, data: "title already exists" });

    await db.query(
      `INSERT INTO tasks1 (id, body, title) 
        VALUES (nextval('tasks1_sequence'), $1, $2 ) RETURNING * `,
      [taskBody, taskTitle]
    );

    openTasks = await db.query("SELECT * FROM tasks1", []);
    res.json({
      data: { openTasks: openTasks.rows },
      ...resData,
    });
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

router.post("/takeTask", isAuth, async (req: authExpressReq, res: Response) => {
  try {
    const resData: any = new Object();
    if (req.cookie) resData.cookie = req.cookie;

    const { taskId }: { taskId: number } = req.body;

    const userId: number = req.user!.id,
      userName: string = req.user!.username;

    const thisTask = await getTaskById(taskId, 1);
    if (!thisTask) return res.json({ err: true, data: "task not found" });

    let newTakenTask = await db.query(
      `INSERT INTO tasks2 (id, body, title, user_id, user_name)
    VALUES ($1, $2, $3, $4 , $5 ) RETURNING * `,
      [thisTask.id, thisTask.body, thisTask.title, userId, userName]
    );

    newTakenTask = newTakenTask?.rows?.[0];
    if (!newTakenTask) return res.json({ err: true, data: "Database error" });

    await db.query("DELETE FROM tasks1 WHERE id=$1", [thisTask.id]);
    const openTasks = await db.query("SELECT * FROM tasks1", []);
    res.json({
      err: false,
      data: { newTakenTask, openTasks: openTasks.rows },
      ...resData,
    });
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

router.delete(
  "/removeTask",
  isAuth,
  async (req: authExpressReq, res: Response) => {
    try {
      const resData: any = new Object();
      if (req.cookie) resData.cookie = req.cookie;

      const { taskId }: { taskId: number } = req.body;

      const thisTask = await getTaskById(taskId, 2);
      if (!thisTask) return res.json({ err: true, data: "Task not found" });

      let newOpenTask = await db.query(
        `INSERT INTO tasks1 (id, body, title) 
        VALUES ($1, $2, $3 ) RETURNING * `,
        [thisTask.id, thisTask.body, thisTask.title]
      );
      newOpenTask = newOpenTask?.rows?.[0];
      if (!newOpenTask) return res.json({ err: true, data: "Database error" });

      await db.query("DELETE FROM tasks2 WHERE id=$1", [thisTask.id]);
      const takenTasks = await db.query("SELECT * FROM tasks2", []);

      res.json({
        err: false,
        data: { newOpenTask, takenTasks: takenTasks.rows },
        ...resData,
      });
    } catch (err) {
      return res.json({ err: true, data: err.message });
    }
  }
);

router.post(
  "/completedTask",
  isAuth,
  async (req: authExpressReq, res: Response) => {
    try {
      const resData: any = new Object();
      if (req.cookie) resData.cookie = req.cookie;

      const { taskId }: { taskId: number } = req.body;
      const userId: number = req.user!.id,
        userName: string = req.user!.username;

      const thisTask = await getTaskById(taskId, 2);
      if (!thisTask) return res.json({ err: true, data: "Task not found" });

      let newCompletedTask = await db.query(
        `INSERT INTO tasks3 (id, body, title, user_id, user_name)
      VALUES ($1, $2, $3, $4 , $5 ) RETURNING * `,
        [thisTask.id, thisTask.body, thisTask.title, userId, userName]
      );
      newCompletedTask = newCompletedTask?.rows?.[0];
      if (!newCompletedTask)
        return res.json({ err: true, data: "Database error" });

      await db.query("DELETE FROM tasks2 WHERE id=$1", [thisTask.id]);

      const takenTasks = await db.query("SELECT * FROM tasks2", []);
      res.json({
        err: false,
        data: { newCompletedTask, takenTasks: takenTasks.rows },
        ...resData,
      });
    } catch (err) {
      res.json({ err: true, data: err.message });
    }
  }
);

const getTaskById = async (taskId: number, table: number) => {
  try {
    let thisTask: any = await db.query(
      `SELECT * FROM tasks${table} WHERE id=$1`,
      [taskId]
    );
    return thisTask?.rows?.[0];
  } catch (err) {
    return false;
  }
};
export default router;
