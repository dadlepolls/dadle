import { ApolloError } from "@apollo/client";
import { Collapse, Input, Result } from "antd";
import Head from "next/head";
import React from "react";

const ErrorPage = ({ error }: { error: ApolloError }) => {
  return (
    <>
      <Head>
        <title>Fehler | DadleX</title>
      </Head>
      <Result
        status="500"
        title="Ups, da ist was schiefgelaufen..."
        subTitle={
          <>
            Beim Aufrufen der Seite ist ein Fehler aufgetreten. Bitte wende dich
            an deinen Administrator.
            <br />({error.message})
          </>
        }
        extra={
          <Collapse ghost>
            <Collapse.Panel key="1" header="Weitere Details">
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

