import { Card, Spin, Typography } from "antd";

const LoadingCard = ({ title }: { title?: string }) => {
  return (
    <Card style={{ marginTop: 16, marginBottom: 16 }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title ? (
          <div>
            <Typography.Title>{title}</Typography.Title>
          </div>
        ) : null}
        <Spin size="large" />
      </div>
    </Card>
  );
};

export { LoadingCard };

