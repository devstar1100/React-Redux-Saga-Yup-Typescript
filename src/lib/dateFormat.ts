export const dateFormatWithTime = (d: Date, withTime?: boolean): string => {
  return (
    [
      d.getFullYear(),
      d.getMonth() < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1,
      d.getDate() < 10 ? "0" + d.getDate() : d.getDate(),
    ].join("-") +
    (withTime ? " " + ([d.getHours(), d.getMinutes()].join(":") + (d.getHours() >= 12 ? " PM" : " AM")) : "")
  );
};
