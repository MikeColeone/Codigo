import { Button, Form, Input } from "antd";

const EMPTY_CAPTCHA_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

interface SendCodeFieldProps {
  captchaRequired: boolean;
  captchaSrc: string;
  captchaLoading: boolean;
  countDown: number;
  countdownActive: boolean;
  sendCodeLoading: boolean;
  getCode: () => Promise<void>;
  refreshCaptcha: () => void;
}

/**
 * 渲染短信验证码与图形验证码表单项。
 *
 * @param props - 验证码字段渲染所需的状态与动作
 * @returns 验证码表单片段
 */
export function SendCodeField(props: SendCodeFieldProps) {
  const {
    captchaRequired,
    captchaSrc,
    captchaLoading,
    countDown,
    countdownActive,
    sendCodeLoading,
    getCode,
    refreshCaptcha,
  } = props;

  return (
    <>
      {captchaRequired ? (
        <Form.Item
          label="图形验证码"
          name="captcha"
          rules={[{ required: true, message: "请输入图形验证码!" }]}
        >
          <div>
            <Input className="w-[122px]" disabled={captchaLoading} />
            <img
              alt="captcha"
              onClick={refreshCaptcha}
              src={
                captchaSrc
                  ? `data:image/svg+xml;base64,${btoa(captchaSrc)}`
                  : EMPTY_CAPTCHA_SRC
              }
              className="w-[102px] h-[32px] inline-block rounded-md bg-slate-100"
            />
          </div>
        </Form.Item>
      ) : null}

      <Form.Item
        label="手机验证码"
        name="sendCode"
        rules={[{ required: true, message: "请输入手机验证码!" }]}
      >
        <div>
          <Input className="w-[111px] mr-2" />
          <Button
            onClick={() => {
              void getCode();
            }}
            disabled={countdownActive}
            className="w-[105px]"
          >
            {sendCodeLoading
              ? "加载中"
              : countdownActive
              ? `${countDown}秒后重发`
              : "获取验证码"}
          </Button>
        </div>
      </Form.Item>
    </>
  );
}
