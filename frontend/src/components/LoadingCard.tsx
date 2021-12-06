import { Card, Spin } from "antd";

const LoadingCard = () => {
  return (
    <Card style={{ marginTop: 16, marginBottom: 16 }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    </Card>
  );
};

export { LoadingCard };

