import { cn } from "../../utils/cn";

const Heading = ({ title, className, ...rest }) => {
  return (
    <h1
      className={cn("mb-0! text-2xl! md:text-4xl! font-bold", {
        [className]: className,
      })}
      {...rest}
    >
      {title}
    </h1>
  );
};
export default Heading;
