import type { SendCodeRequest } from "@codigo/materials";
import type { FormInstance } from "antd";
import { useRequest } from "ahooks";
import { useCallback, useEffect, useState } from "react";
import { getCaptcha, sendCode } from "@/modules/auth/api/user";

const COUNTDOWN_SECONDS = 60;

export function useSendCode(form: FormInstance, type: string) {
  const [countDown, setCountDown] = useState(0);
  const [captchaSrc, setCaptchaSrc] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);

  const { run: requestCaptcha, loading: captchaLoading } = useRequest(
    () => getCaptcha({ type }),
    {
      manual: true,
      onSuccess: (result) => {
        setCaptchaSrc(result.data);
      },
    }
  );

  /**
   * 刷新图形验证码。
   */
  const refreshCaptcha = useCallback(() => {
    requestCaptcha();
  }, [requestCaptcha]);

  const { run: execSendCode, loading: sendCodeLoading } = useRequest(
    (values: SendCodeRequest) => sendCode(values),
    {
      manual: true,
      onSuccess: () => {
        setCountDown(COUNTDOWN_SECONDS);
        setCaptchaRequired(false);
      },
      onError: (error: any) => {
        const code = error?.response?.data?.code;
        if (code === 602) {
          setCaptchaRequired(true);
          form.setFieldsValue({ captcha: "" });
          refreshCaptcha();
        }
      },
    }
  );

  const countdownActive = countDown > 0;

  useEffect(() => {
    if (!countdownActive) return;

    const timer = window.setInterval(() => {
      setCountDown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdownActive]);

  /**
   * 校验表单后发送短信验证码。
   */
  const getCode = useCallback(async () => {
    const fields = (await form
      .validateFields(captchaRequired ? ["phone", "captcha"] : ["phone"])
      .catch(() => null)) as {
      phone?: string;
      captcha?: string;
    } | null;

    if (!fields?.phone) return;
    if (captchaRequired && !fields.captcha) return;

    execSendCode({
      phone: fields.phone,
      type,
      ...(captchaRequired ? { captcha: fields.captcha } : {}),
    });
  }, [captchaRequired, execSendCode, form, type]);

  return {
    captchaRequired,
    captchaSrc,
    captchaLoading,
    countDown,
    countdownActive,
    getCode,
    refreshCaptcha,
    sendCodeLoading,
  };
}
