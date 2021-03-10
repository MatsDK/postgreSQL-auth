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
      takenTasks = await db.query("SELECT * FROM tasks2", []);
    res.json({
      data: { openTasks: openTasks.rows, takenTasks: takenTasks.rows },
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
      takenTasks = await db.query("SELECT * FROM tasks2", []);
    if (
      openTasks.rows.find(
        (x: any) => x.title.toLowerCase() === taskTitle.toLowerCase()
      ) ||
      takenTasks.rows.find(
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

    let thisTask: any = await db.query("SELECT * FROM tasks1 WHERE id=$1", [
      taskId,
    ]);
    if (!thisTask?.rows?.[0])
      return res.json({ err: true, data: "Task not found" });

    thisTask = thisTask.rows[0];
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

export default router;
