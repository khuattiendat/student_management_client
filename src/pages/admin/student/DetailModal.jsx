import { Modal, Tag, Typography } from "antd";
import dayjs from "dayjs";
const { Title } = Typography;
const DetailModal = ({ open, onClose, detailStudent }) => {
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      {detailStudent && (
        <div className="flex flex-col gap-3">
          <div>
            <Title level={5} className="mb-1!">
              Địa chỉ
            </Title>
            <span>
              {[
                detailStudent.addressDetail,
                detailStudent.wardName,
                detailStudent.provinceName,
              ]
                .filter(Boolean)
                .join(", ") || "Không có địa chỉ"}
            </span>
          </div>

          <div>
            <Title level={5} className="mb-1!">
              Lớp
            </Title>
            {Array.isArray(detailStudent.classStudents) &&
            detailStudent.classStudents.length ? (
              <div className="flex flex-wrap gap-1">
                {detailStudent.classStudents.map((item) => (
                  <Tag key={item.id}>{item?.classEntity?.name}</Tag>
                ))}
              </div>
            ) : (
              <span>Không có lớp</span>
            )}
          </div>

          <div>
            <Title level={5} className="mb-1!">
              Phụ huynh
            </Title>
            {Array.isArray(detailStudent.parents) &&
            detailStudent.parents.length ? (
              <div className="flex flex-col gap-1">
                {detailStudent.parents.map((parent) => (
                  <span key={parent.id || `${parent.name}-${parent.phone}`}>
                    {parent.name} ({parent.phone || "—"})
                  </span>
                ))}
              </div>
            ) : (
              <span>Không có phụ huynh</span>
            )}
          </div>

          <div>
            <Title level={5} className="mb-1!">
              Gói học
            </Title>
            {Array.isArray(detailStudent.packages) &&
            detailStudent.packages.length ? (
              <div className="flex flex-wrap gap-1">
                {detailStudent.packages.map((item) => (
                  <Tag key={item.id}>{item.name}</Tag>
                ))}
              </div>
            ) : (
              <span>Không có gói học</span>
            )}
          </div>

          <div>
            <Title level={5} className="mb-1!">
              Ngày tạo
            </Title>
            <span>
              {detailStudent.createdAt
                ? dayjs(detailStudent.createdAt).format("DD/MM/YYYY")
                : "Không có ngày tạo"}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DetailModal;
