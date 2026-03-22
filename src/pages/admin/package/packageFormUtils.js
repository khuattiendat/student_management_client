export const getInitialValues = (editing) => ({
  name: editing?.name ?? "",
  type: editing?.type ?? "general",
  price: editing?.price ? Number(editing.price) : undefined,
  totalSessions: editing?.totalSessions ?? undefined,
  info: {
    type: editing?.info?.type ?? editing?.type ?? "general",
    curriculum:
      editing?.info?.curriculum ??
      editing?.schoolSubject ??
      editing?.curriculum ??
      undefined,
    comboType: editing?.info?.comboType ?? editing?.comboType ?? undefined,
    ageGroup: editing?.info?.ageGroup ?? editing?.ageGroup ?? undefined,
    certificateType:
      editing?.info?.certificateType ?? editing?.certificateType ?? undefined,
    subject:
      editing?.info?.subject ?? editing?.schoolSubjectType ?? editing?.subject,
    class: editing?.info?.class ?? editing?.classType ?? editing?.class,
  },
});

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );

const buildTypeSpecificInfo = (type, info) => {
  if (type === "general") {
    return compactObject({
      type,
      curriculum: info?.curriculum,
      comboType: info?.comboType,
      ageGroup: info?.curriculum === "chinese" ? info?.ageGroup : undefined,
    });
  }

  if (type === "certificate") {
    return compactObject({
      type,
      certificateType: info?.certificateType,
      comboType: info?.comboType,
    });
  }

  if (type === "school_subject") {
    return compactObject({
      type,
      subject: info?.subject,
      class: info?.class,
      comboType: info?.comboType,
    });
  }

  return { type };
};

export const buildPackagePayload = (values) => ({
  name: values.name,
  type: values.type,
  price: values.price,
  totalSessions: values.totalSessions,
  info: buildTypeSpecificInfo(values.type, values.info),
});
