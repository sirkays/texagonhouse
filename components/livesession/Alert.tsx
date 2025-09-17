import Link from "next/link";
import Image from "next/image";
import {Card, CardContent} from "../ui/card";
import {Button} from "../ui/button";
import clsx from "clsx";

interface AlertProps {
  title: string;
  iconUrl?: string;
  className?: string;
  style?: any;
}

const Alert = ({title, iconUrl, className, style}: AlertProps) => {
  return (
    <section className="flex justify-center items-center mt-5">
      <Card
        style={style}
        className={clsx(
          className,
          "w-full max-w-[520px] border-none bg-gray-500 p-6 py-9 text-white shadow-2xl scale-110"
        )}>
        <CardContent>
          <div className="flex flex-col gap-9 ">
            <div className="flex flex-col gap-3.5">
              {iconUrl && (
                <div className="flex-center">
                  <Image src={iconUrl} width={72} height={72} alt="icon" />
                </div>
              )}
              <p className="text-center text-xl font-semibold">{title}</p>
            </div>

            <Button asChild className="bg-gray-900 rounded-2xl">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Alert;
