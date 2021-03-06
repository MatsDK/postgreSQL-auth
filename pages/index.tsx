import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import cookie from "cookie";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useCookies } from "react-cookie";
import styles from "../css/index.module.css";
import Textarea from "react-expanding-textarea";
import { NextRouter, useRouter } from "next/router";

interface userObject {
  id: number;
  username: string;
  email: string;
}

interface indexProps {
  isAuth: boolean;
  user: userObject;
  cookie?: string;
}

interface openTasks {
  id: number;
  body: string;
  title: string;
}

interface takenTasks extends openTasks {
  user_id: number;
  user_name: string;
}

const Index = (props: indexProps): JSX.Element => {
  const [cookie, setCookie] = useCookies(["jid"]);
  const [isAuth, setIsAuth] = useState<boolean>(props.isAuth);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [openTasks, setOpenTasks] = useState<openTasks[]>([]);
  const [completedTasks, setCompletedTasks] = useState<takenTasks[]>([]);
  const [takenTasks, setTakenTasks] = useState<takenTasks[]>([]);
  const [otherTakenTasks, setOtherTakenTasks] = useState<takenTasks[]>([]);
  const [myTakenTasks, setMyTakenTasks] = useState<takenTasks[]>([]);
  const [taskBody, setTaskBody] = useState<string>("");
  const router: NextRouter = useRouter();

  useEffect(() => {
    if (props.cookie)
      setCookie("jid", props.cookie, {
        maxAge: 7200,
      });
    if (isAuth) {
      axios({
        method: "GET",
        url: "http://localhost:3001/data",
      }).then((res) => {
        if (res.data.err) return alert(res.data.data);
        setOpenTasks(res.data.data.openTasks.reverse());
        setCompletedTasks(res.data.data.doneTasks.reverse());
        setTakenTasks(res.data.data.takenTasks.reverse());
      });
    }
  }, []);

  useEffect(() => {
    let myTasks: takenTasks[] = [],
      otherTasks: takenTasks[] = [];
    takenTasks.forEach((task: takenTasks) => {
      if (task.user_id === props.user.id) myTasks.push(task);
      else otherTasks.push(task);
    });

    setMyTakenTasks(myTasks);
    setOtherTakenTasks(otherTasks);
  }, [takenTasks]);

  const createTask = (e: any) => {
    if (!isAuth) return;
    e.preventDefault();
    if (!taskTitle.replace(/\s/g, "").length)
      return alert("Task should have a title");

    axios({
      method: "POST",
      url: "http://localhost:3001/data",
      data: {
        taskTitle,
        taskBody,
        cookie,
      },
    }).then((res) => {
      if (res.data.err) return alert(res.data.data);
      if ("isAuth" in res.data) setIsAuth(res.data.isAuth);
      if (res.data.cookie) setCookie("jid", res.data.cookie, { maxAge: 7200 });
      setOpenTasks(res.data.data.openTasks.reverse());
    });
  };

  const takeTask = (taskId: number) => {
    if (!isAuth) return;
    axios({
      method: "POST",
      url: "http://localhost:3001/takeTask",
      data: { taskId, cookie },
    }).then((res) => {
      if (res.data.err) return alert(res.data.data);
      if ("isAuth" in res.data) setIsAuth(res.data.isAuth);
      if (res.data.cookie) setCookie("jid", res.data.cookie, { maxAge: 7200 });

      setTakenTasks((takenTasks) => [
        res.data.data.newTakenTask,
        ...takenTasks,
      ]);
      setOpenTasks(res.data.data.openTasks.reverse());
    });
  };

  const removeTask = (taskId: number) => {
    if (!isAuth) return;

    axios({
      method: "DELETE",
      url: "http://localhost:3001/removeTask",
      data: { taskId, cookie },
    }).then((res) => {
      if (res.data.err) return alert(res.data.data);
      if ("isAuth" in res.data) setIsAuth(res.data.isAuth);
      if (res.data.cookie) setCookie("jid", res.data.cookie, { maxAge: 7200 });

      setOpenTasks((openTasks) => [res.data.data.newOpenTask, ...openTasks]);
      setTakenTasks(res.data.data.takenTasks);
    });
  };

  const completedTask = (taskId: number) => {
    if (!isAuth) return;

    axios({
      method: "POST",
      url: "http://localhost:3001/completedTask",
      data: { taskId, cookie },
    }).then((res) => {
      if (res.data.err) return alert(res.data.data);
      if ("isAuth" in res.data) setIsAuth(res.data.isAuth);
      if (res.data.cookie) setCookie("jid", res.data.cookie, { maxAge: 7200 });

      setCompletedTasks((completedTask) => [
        res.data.data.newCompletedTask,
        ...completedTask,
      ]);
      setTakenTasks(res.data.data.takenTasks);
    });
  };

  const hanleLogout = () => {
    setCookie("jid", "", { maxAge: 0 });
    setIsAuth(false);
    router.push("/");
  };

  return (
    <div>
      <div className={styles.navBar}>
        <div>
          <Link href="/">Home</Link>
          <Link href="/register">Register</Link>
          {!isAuth ? (
            <Link href="/login">Login</Link>
          ) : (
            <div onClick={hanleLogout}>Logout</div>
          )}
        </div>
        {isAuth && <p>Logged in as {props.user.username}</p>}
      </div>
      {isAuth ? (
        <div className={styles.mainContainer}>
          <div className={styles.openTasks}>
            <h2 className={styles.openTasksHeader}>Open Tasks</h2>
            <>
              <form className={styles.newTaskForm} onSubmit={createTask}>
                <input
                  defaultValue={taskTitle}
                  onChange={(e: any) => setTaskTitle(e.target.value)}
                  type="text"
                  placeholder="Enter a Task Title"
                />
                <Textarea
                  className={styles.textArea}
                  defaultValue={taskBody}
                  maxLength={3000}
                  onChange={(e: any) => setTaskBody(e.target.value)}
                  placeholder="Enter a Task Body"
                />
                <button type="submit">Submit</button>
              </form>
              {openTasks.map((task: openTasks) => (
                <div key={task.id} className={styles.task}>
                  <h5>{task.title}</h5>
                  <pre>{task.body}</pre>
                  <div className={styles.bottomTask}>
                    <button onClick={() => takeTask(task.id)}>Take</button>
                  </div>
                </div>
              ))}
            </>
          </div>
          <div className={styles.takenTasks}>
            <h2 className={styles.openTasksHeader}>Taken Tasks</h2>
            {myTakenTasks.map((task: takenTasks) => (
              <div key={task.id} className={styles.myTakenTasks}>
                <p>{task.user_name}</p>
                <h5>{task.title}</h5>
                <pre>{task.body}</pre>
                <div className={styles.bottomTask}>
                  <button onClick={() => removeTask(task.id)}>Remove</button>
                  <button onClick={() => completedTask(task.id)}>Done</button>
                </div>
              </div>
            ))}
            {!!myTakenTasks.length && (
              <div className={styles.separatorLine}></div>
            )}
            {otherTakenTasks.map((task: takenTasks) => (
              <div key={task.id} className={styles.takenTask}>
                <p>{task.user_name}</p>
                <h5>{task.title}</h5>
                <pre>{task.body}</pre>
              </div>
            ))}
          </div>
          <div className={styles.takenTasks}>
            <h2 className={styles.openTasksHeader}>Completed Tasks</h2>
            {completedTasks.map((task: takenTasks) => (
              <div key={task.id} className={styles.takenTask}>
                <p>{task.user_name}</p>
                <h5>{task.title}</h5>
                <pre>{task.body}</pre>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.loginMsg}>
          <Link href="/login">Login</Link>
          to see the tasks
        </div>
      )}
    </div>
  );
};

const parseCookies = (req: any) => {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const res = await axios({
    url: "http://localhost:3001/auth/",
    method: "POST",
    data: { cookie: parseCookies(ctx.req) },
  });
  if (res.data.err) console.log(res.data.data);

  return {
    props: { ...res.data },
  };
};

export default Index;
