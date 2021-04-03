module.exports = {
  apps : [{
    name: "maposrm",
    script: "listener.js",
    watch: false,
    instances: "max",
    pid_file: "./storage/pid/maposrm.pid",
    namespace: "map_osm",
    max_memory_restart: '128M',
    cwd: __dirname,
    exec_mode : "cluster",
    disable_logs: true,
    error_log: "./storage/log/maposrm.error.log",
    out_file: "/dev/null",
    restart_delay: 1000,
    args: [
      "--max-old-space-size=2048"
    ]
  }],
};
