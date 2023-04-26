import { ApolloError } from "@apollo/client";
import { Collapse, Input, Result } from "antd";
import { useTranslation } from "next-i18next";
import Head from "next/head";

const ErrorPage = ({ error }: { error: ApolloError | string }) => {
  const { t } = useTranslation();
  if (typeof error === "string") {
    error = {
      message: error,
      clientErrors: [],
      extraInfo: [],
      graphQLErrors: [],
      networkError: null,
      protocolErrors: [],
      name: "",
    };
  }

  return (
    <>
      <Head>
        <title>{t("error_page_title")} | Dadle</title>
      </Head>
      <Result
        status="500"
        title={t("error_excuse")}
        subTitle={
          <>
            {t("error_explanation_generic")}
            <br />({error.message})
          </>
        }
        extra={
          <Collapse ghost>
            <Collapse.Panel key="1" header={t("error_more_details")}>
              <Input.TextArea
                readOnly
                autoSize
                value={JSON.stringify(error, null, 2)}
              />
            </Collapse.Panel>
          </Collapse>
        }
      />
    </>
  );
};

export { ErrorPage };

