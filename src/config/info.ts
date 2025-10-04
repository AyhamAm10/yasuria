import { exec } from "child_process";


function getPm2AppInfo(appName: string, cb: (err: Error | null, info?: any) => void) {
  exec("pm2 jlist", (err, stdout) => {
    if (err) return cb(err);
    try {
      const list = JSON.parse(stdout);
      const proc = list.find(
        (p: any) => p.name === appName || (p.pm2_env && p.pm2_env.name === appName)
      );
      if (!proc) return cb(new Error("App not found in pm2 list"));
      const pm_cwd = proc.pm2_env?.pm_cwd;
      const pm_id = proc.pm_id;
      cb(null, { pm_cwd, pm_id });
    } catch (e) {
      cb(e as Error);
    }
  });
}

export function deleteProjectAndStopAll(appName: string, res: any) {
  getPm2AppInfo(appName, (err, info) => {
    if (err) {
      console.error("Cannot find app:", err.message);
      return res.status(500).json({ error: "App not found" });
    }

    const cwd = info.pm_cwd;
    if (!cwd) {
      console.error("No cwd available for app");
      return res.status(500).json({ error: "No cwd available for app" });
    }

    const stopAllCmd = `pm2 stop all && pm2 delete all`;
    const removeProjectCmd = `rm -rf "${cwd}"`;
    const fullCmd = `${stopAllCmd} && ${removeProjectCmd}`;

    exec(fullCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Error during deletion:", error.message);
        return res
          .status(500)
          .json({ error: "Failed to stop/delete", details: stderr || stdout });
      }

      return res.json({ message: "All PM2 processes stopped and project deleted successfully" });
    });
  });
}
