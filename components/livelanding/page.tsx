import MainMenu from "@/components/livesession/MainMenu";
import StatusBar from "@/components/livesession/StatusBar";

const HomePage = () => {
  return (
    <div className="flex flex-col-reverse sm:flex-col gap-32 pt-10 sm:pt-20 sm:pl-10 items-center justify-evenly max-md:gap-10 md:flex-row animate-fade-in">
      <MainMenu />
      <StatusBar />
    </div>
  );
};

export default HomePage;
