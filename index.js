const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");
const request = require("request");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// // 更新计数
// app.post("/api/count", async (req, res) => {
//   const { action } = req.body;
//   if (action === "inc") {
//     await Counter.create();
//   } else if (action === "clear") {
//     await Counter.destroy({
//       truncate: true,
//     });
//   }
//   res.send({
//     code: 0,
//     data: await Counter.count(),
//   });
// });

// // 获取计数
// app.get("/api/count", async (req, res) => {
//   const result = await Counter.count();
//   res.send({
//     code: 0,
//     data: result,
//   });
// });

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
    if (req.headers["x-wx-source"]) {
        res.send(req.headers["x-wx-openid"]);
    }
});

app.post("/api/chat", async (req, res) => {
    console.log("消息推送", req.body);
    // 从 header 中取appid，如果 from-appid 不存在，则不是资源复用场景，可以直接传空字符串，使用环境所属账号发起云调用
    const appid = req.headers["x-wx-from-appid"] || "";
    const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body;
    console.log("推送接收的账号", ToUserName, "创建时间", CreateTime);
    res.send({
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: CreateTime,
        MsgType: "text",
        Content:"这是回复的消息"
    })
});


function sendmess(appid, mess) {
    return new Promise((resolve, reject) => {
        request(
            {
                method: "POST",
                url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
                body: JSON.stringify(mess),
            },
            function (error, response) {
                if (error) {
                    console.log("接口返回错误", error);
                    reject(error.toString());
                } else {
                    console.log("接口返回内容", response.body);
                    resolve(response.body);
                }
            }
        );
    });
}


app.listen(80, function () {
    console.log("服务启动成功！");
});
