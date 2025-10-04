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
      <div className="space-y-6 sm:space-y-8">
        <AnimatedContainer
          animation="staggerChildren"
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Monitor your invoice performance and financial metrics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="outline"
              className="hover-lift bg-transparent w-full sm:w-auto"
              onClick={handleViewReports}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button size="sm" className="hover-lift w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
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

        <AnimatedContainer animation="fadeIn" delay={0.6}>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">
              Quick Actions
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Access key features and manage your financial operations
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickAccessCards.map((card, index) => (
              <HoverAnimated key={card.title} hoverScale={1.03} hoverY={-4}>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg ${
                          card.color === "primary"
                            ? "bg-primary/10"
                            : card.color === "accent"
                            ? "bg-accent/10"
                            : "bg-success/10"
                        }`}>
                        <card.icon
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            card.color === "primary"
                              ? "text-primary"
                              : card.color === "accent"
                              ? "text-accent"
                              : "text-success"
                          }`}
                        />
                      </div>
                      <CardTitle className="text-sm sm:text-base font-semibold">
                        {card.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                      {card.description}
                    </CardDescription>
                    <Button asChild className="w-full hover-lift text-sm">
                      <Link href={card.href}>
                        {card.title.split(" ")[0]}{" "}
                        {card.title.split(" ")[1] || ""}
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </HoverAnimated>
            ))}
          </div>
        </AnimatedContainer>
      </div>

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={handleCloseReportsModal}
      />
    </>
  );
}
