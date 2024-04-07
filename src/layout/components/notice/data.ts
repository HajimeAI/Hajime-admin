export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "primary" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
}

export const noticesData: TabItem[] = [
  {
    key: "1",
    name: "notice",
    list: [
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png",
        title: "You have received 12 new weekly reports.",
        datetime: "one year ago",
        description: "",
        type: "1"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png",
        title: "The front-end expert you recommended has passed the third round of interviews.",
        datetime: "one year ago",
        description: "",
        type: "1"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png",
        title: "This template can distinguish between multiple notification types.",
        datetime: "one year ago",
        description: "",
        type: "1"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png",
        title:
          "Display how to handle when the title content exceeds one line; if the content exceeds one line, it will be automatically truncated and support tooltip to display the full title.",
        datetime: "one year ago",
        description: "",
        type: "1"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png",
        title: "The left icon is used to distinguish between different types.",
        datetime: "one year ago",
        description: "",
        type: "1"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png",
        title: "The left icon is used to distinguish between different types.",
        datetime: "one year ago",
        description: "",
        type: "1"
      }
    ]
  },
  {
    key: "2",
    name: "messagge",
    list: [
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg",
        title: "Li Bai commented on you.",
        description: "There will be a time when I'll ride the wind and break the waves; I'll hang up my cloud sail to cross the blue sea.",
        datetime: "one year ago",
        type: "2"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg",
        title: "Li Bai replied to you.",
        description: "It's hard to travel, it's hard to travel; there are many diverging paths, where am I now?",
        datetime: "one year ago",
        type: "2"
      },
      {
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg",
        title: "title",
        description:
          "Please move the mouse here to test how very long messages are handled in this place. In this example, the maximum number of lines set for the description is 2, and content exceeding 2 lines will be truncated and can be viewed in full through a tooltip.",
        datetime: "one year ago",
        type: "2"
      }
    ]
  },
  {
    key: "3",
    name: "To-do",
    list: [
      {
        avatar: "",
        title: "Task Name",
        description: "The task needs to be started by November 16, 2022, at 20:00.",
        datetime: "",
        extra: "Not started.",
        status: "info",
        type: "3"
      },

    ]
  }
];
