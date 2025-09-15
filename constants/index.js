import {Home, Calendar, History, Video, DoorOpen} from "lucide-react";

export const navLinks = [
  {
    icon: Home,
    route: "/main/home",
    label: "Home",
  },

  {
    icon: Calendar,
    route: "/main/home/upcoming",
    label: "Upcoming",
  },
  {
    icon: History,
    route: "/main/home/previous",
    label: "Previous",
  },
  // {
  //   icon: Video,
  //   route: "/main/home/recordings",
  //   label: "Recordings",
  // },
  {
    icon: DoorOpen,
    route: "/main/home/my-home",
    label: "My Room",
  },
];
