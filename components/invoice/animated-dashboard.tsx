"use client";

import {useState} from "react";
import {PaymentStatusDashboard} from "@/components/invoice/payment-status-dashboard";
import {DashboardOverview} from "@/components/invoice/dashboard-overview";
import {ReportsModal} from "@/components/invoice/reports-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  CreditCard,
  MessageSquare,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  AnimatedContainer,
  HoverAnimated,
} from "@/components/invoice/gsap-animations";

const quickAccessCards = [
  {
    title: "Transaction History",
    description:
      "View and manage all your transaction records with advanced filtering and comprehensive search capabilities.",
    icon: FileText,
    href: "/transactions",
    color: "primary",
  },
  {
    title: "Payment Management",
    description:
      "Monitor payment statuses, track overdue payments, and manage comprehensive payment workflows.",
    icon: CreditCard,
    href: "/payments",
    color: "accent",
  },
  {
    title: "Support Center",
    description:
      "Submit payment complaints, track support tickets, and get professional help with payment issues.",
    icon: MessageSquare,
    href: "/complaints",
    color: "success",
  },
];

export function AnimatedDashboard() {
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const handleViewReports = () => {
    setIsReportsModalOpen(true);
  };

  const handleCloseReportsModal = () => {
    setIsReportsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        <AnimatedContainer
          animation="staggerChildren"
          className="flex flex-col gap-4">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl lg:text-3xl">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Monitor your invoice performance and financial metrics
            </p>
          </div>
          <div className="">
            <Button
              size="lg"
              variant="outline"
              className="hover-lift bg-transparent w-full sm:w-20 shadow-md md:w-auto"
              onClick={handleViewReports}>
              <TrendingUp className="h-5 w-5 mr-2" />
              View Reports
            </Button>
          </div>
        </AnimatedContainer>

        {/* Payment Status with Slide Animation */}
        <AnimatedContainer animation="slideUp" delay={0.2}>
          <PaymentStatusDashboard />
        </AnimatedContainer>

        {/* Dashboard Overview with Scale Animation */}
        <AnimatedContainer animation="scaleIn" delay={0.4}>
          <DashboardOverview />
        </AnimatedContainer>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickAccessCards.map((card, index) => (
            <AnimatedContainer
              key={index}
              animation="fadeIn"
              delay={0.6 + index * 0.2}>
              <HoverAnimated>
                <Card className={`border-${card.color} shadow-md`}>
                  <CardHeader>
                    <card.icon className="h-6 w-6 mb-2" />
                    <CardTitle className="text-lg md:text-xl">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={card.href}>
                      <Button
                        variant="ghost"
                        className={`text-${card.color} hover:text-${card.color}-dark w-full md:w-auto`}>
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </HoverAnimated>
            </AnimatedContainer>
          ))}
        </div>
      </div>

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={handleCloseReportsModal}
      />
    </>
  );
}
