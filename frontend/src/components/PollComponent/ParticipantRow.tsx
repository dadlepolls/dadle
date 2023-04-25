import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Input, Popconfirm, Space, message } from "antd";
import { useTranslation } from "next-i18next";
import { useState } from "react";

const ParticipantRow = ({
  nameHint,
  editable = false,
  deletable = true,
  deleteConfirmation = true,
  className = "",
  allowEdit = true,
  canEditName = true,
  onEditClick = () => {},
  onSaveClick = () => {},
  onDeleteClick = () => {},
}: {
  nameHint: string;
  editable?: boolean;
  deletable?: boolean;
  deleteConfirmation?: boolean;
  className?: string;
  allowEdit?: boolean;
  canEditName?: boolean;
  onEditClick?: () => any;
  onSaveClick?: (_newName: string) => any;
  onDeleteClick?: () => any;
}) => {
  const { t } = useTranslation("pollresponses");
  const [name, setName] = useState(nameHint);

  return (
    <div className={`pollpage--participant ${className}`}>
      <div className="pollpage--participant-name">
        {editable && canEditName ? (
          <Input
            style={{ width: "300px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          nameHint
        )}
      </div>
      <div className="pollpage--participant-action-btn">
        {editable ? (
          <Space.Compact>
            {deletable ? (
              deleteConfirmation ? (
                <Popconfirm
                  title={t("participation_delete_confirmation")}
                  okText={t("participation_delete_confirmation_yes")}
                  cancelText={t("participation_delete_confirmation_no")}
                  onConfirm={() => onDeleteClick()}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ) : (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteClick()}
                />
              )
            ) : null}
            <Button
              type="text"
              onClick={() => {
                if (!name) message.error(t("error_name_required"));
                else onSaveClick(name);
              }}
              icon={<SaveOutlined />}
            />
          </Space.Compact>
        ) : allowEdit ? (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setName(nameHint);
              onEditClick();
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export { ParticipantRow };

