/* eslint-disable @typescript-eslint/no-unused-vars */
/*この関数をスケジューラーで回して接続を維持する。*/
function doRetain() {
  sendGlitch(GLITCH_URL);
}

function sendGlitch(uri: string) {
  const json = {
    userid: '',
    channelid: '',
    message: '',
  };
  const response = UrlFetchApp.fetch(uri, {
    contentType: 'application/json; charset=utf-8',
    method: 'post',
    payload: json,
    headers: json,
    muteHttpExceptions: true,
  });
  Logger.log(response);
}
