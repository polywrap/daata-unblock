export const mockWorkflow = {
  id: "1",
  actions: [
    {
      id: "1.2",
      order: 1,
      isExecuting: false,
      invocation: {
        uri: "plugin/logger@1.0.0",
        method: "log",
        args: {
          level: 2,
          message: "FIRST MESSAGE",
        },
      },
    },
    {
      id: "1.3",
      order: 1,
      isExecuting: false,
      invocation: {
        uri: "plugin/logger@1.0.0",
        method: "log",
        args: {
          level: 2,
          message: "$1",
        },
      },
    },
  ],
};
