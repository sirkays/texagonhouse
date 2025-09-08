"use client";

import {useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define the Subscription interface
interface Subscription {
  id: number;
  schoolName: string;
  plan: string;
  price: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenewal: boolean;
  paymentMethod: string;
  lastPayment: string;
  nextBilling: string;
  students: number;
  teachers: number;
}

export function SubscriptionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const subscriptionsPerPage = 5;

  const subscriptions: Subscription[] = [
    {
      id: 1,
      schoolName: "Lagos State Model College",
      plan: "Premium",
      price: "₦145,000",
      startDate: "2023-01-15",
      endDate: "2024-01-15",
      status: "Active",
      autoRenewal: true,
      paymentMethod: "Bank Transfer",
      lastPayment: "2023-12-15",
      nextBilling: "2024-01-15",
      students: 1234,
      teachers: 67,
    },
    {
      id: 2,
      schoolName: "Federal Government College",
      plan: "Premium",
      price: "₦120,000",
      startDate: "2023-02-20",
      endDate: "2024-02-20",
      status: "Active",
      autoRenewal: true,
      paymentMethod: "Card Payment",
      lastPayment: "2024-01-20",
      nextBilling: "2024-02-20",
      students: 987,
      teachers: 54,
    },
    {
      id: 3,
      schoolName: "Greenfield Academy",
      plan: "Basic",
      price: "₦89,000",
      startDate: "2023-03-10",
      endDate: "2024-03-10",
      status: "Active",
      autoRenewal: false,
      paymentMethod: "Bank Transfer",
      lastPayment: "2023-03-10",
      nextBilling: "2024-03-10",
      students: 756,
      teachers: 43,
    },
    {
      id: 4,
      schoolName: "Unity High School",
      plan: "Premium",
      price: "₦98,000",
      startDate: "2023-04-05",
      endDate: "2024-04-05",
      status: "Overdue",
      autoRenewal: true,
      paymentMethod: "Card Payment",
      lastPayment: "2023-04-05",
      nextBilling: "2024-04-05",
      students: 654,
      teachers: 38,
    },
    {
      id: 5,
      schoolName: "Bright Future College",
      plan: "Basic",
      price: "₦67,000",
      startDate: "2024-01-12",
      endDate: "2025-01-12",
      status: "Trial",
      autoRenewal: false,
      paymentMethod: "Pending",
      lastPayment: "N/A",
      nextBilling: "2024-02-12",
      students: 543,
      teachers: 32,
    },
  ];

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(
    filteredSubscriptions.length / subscriptionsPerPage
  );
  const indexOfLastSubscription = currentPage * subscriptionsPerPage;
  const indexOfFirstSubscription =
    indexOfLastSubscription - subscriptionsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(
    indexOfFirstSubscription,
    indexOfLastSubscription
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center text-xs xs:text-sm">
            <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Active
          </Badge>
        );
      case "Overdue":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center text-xs xs:text-sm">
            <XCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Overdue
          </Badge>
        );
      case "Trial":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center text-xs xs:text-sm">
            <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Trial
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center text-xs xs:text-sm">
            <AlertTriangle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs xs:text-sm">
            {status}
          </Badge>
        );
    }
  };

  const getPlanBadge = (plan: string) => {
    return plan === "Premium" ? (
      <Badge className="bg-yellow-100 text-yellow-800 text-xs xs:text-sm">
        Premium
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs xs:text-sm">
        Basic
      </Badge>
    );
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 30) return "text-yellow-600";
    return "text-green-600";
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    alert(
      `Subscription for ${selectedSubscription?.schoolName} has been deleted successfully!`
    );
    setIsDeleteDialogOpen(false);
    setSelectedSubscription(null);
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
            Subscription Management
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
            Monitor and manage all school subscriptions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 text-xs xs:text-sm sm:text-base">
              <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-base xs:text-lg sm:text-xl">
                Add New Subscription
              </DialogTitle>
              <DialogDescription className="text-xs xs:text-sm sm:text-base">
                Create a new subscription plan for a school
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 xs:gap-4 py-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="school-select"
                    className="text-xs xs:text-sm sm:text-base">
                    Select School
                  </Label>
                  <Select>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Choose school" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="lsmc"
                        className="text-xs xs:text-sm sm:text-base">
                        Lagos State Model College
                      </SelectItem>
                      <SelectItem
                        value="fgc"
                        className="text-xs xs:text-sm sm:text-base">
                        Federal Government College
                      </SelectItem>
                      <SelectItem
                        value="greenfield"
                        className="text-xs xs:text-sm sm:text-base">
                        Greenfield Academy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="plan-select"
                    className="text-xs xs:text-sm sm:text-base">
                    Subscription Plan
                  </Label>
                  <Select>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Choose plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="basic"
                        className="text-xs xs:text-sm sm:text-base">
                        Basic Plan - ₦50,000/year
                      </SelectItem>
                      <SelectItem
                        value="premium"
                        className="text-xs xs:text-sm sm:text-base">
                        Premium Plan - ₦120,000/year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="start-date"
                    className="text-xs xs:text-sm sm:text-base">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="end-date"
                    className="text-xs xs:text-sm sm:text-base">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-method"
                    className="text-xs xs:text-sm sm:text-base">
                    Payment Method
                  </Label>
                  <Select>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="bank"
                        className="text-xs xs:text-sm sm:text-base">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem
                        value="card"
                        className="text-xs xs:text-sm sm:text-base">
                        Card Payment
                      </SelectItem>
                      <SelectItem
                        value="cash"
                        className="text-xs xs:text-sm sm:text-base">
                        Cash Payment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="auto-renewal"
                    className="text-xs xs:text-sm sm:text-base">
                    Auto Renewal
                  </Label>
                  <Select>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="yes"
                        className="text-xs xs:text-sm sm:text-base">
                        Yes
                      </SelectItem>
                      <SelectItem
                        value="no"
                        className="text-xs xs:text-sm sm:text-base">
                        No
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs xs:text-sm sm:text-base">
                Cancel
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs xs:text-sm sm:text-base">
                Create Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 xs:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 xs:left-2.5 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions by school name, plan, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 xs:pl-8 text-xs xs:text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs xs:text-sm sm:text-base">
                    All Plans
                  </SelectItem>
                  <SelectItem
                    value="premium"
                    className="text-xs xs:text-sm sm:text-base">
                    Premium
                  </SelectItem>
                  <SelectItem
                    value="basic"
                    className="text-xs xs:text-sm sm:text-base">
                    Basic
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs xs:text-sm sm:text-base">
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className="text-xs xs:text-sm sm:text-base">
                    Active
                  </SelectItem>
                  <SelectItem
                    value="overdue"
                    className="text-xs xs:text-sm sm:text-base">
                    Overdue
                  </SelectItem>
                  <SelectItem
                    value="trial"
                    className="text-xs xs:text-sm sm:text-base">
                    Trial
                  </SelectItem>
                  <SelectItem
                    value="suspended"
                    className="text-xs xs:text-sm sm:text-base">
                    Suspended
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            All Subscriptions ({filteredSubscriptions.length})
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">
            Complete list of all school subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs xs:text-sm sm:text-base">
                    School
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs xs:text-sm sm:text-base">
                    Plan & Price
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-xs xs:text-sm sm:text-base">
                    Duration
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs xs:text-sm sm:text-base">
                    Payment Info
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">
                    Users
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">
                    Status
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center text-xs xs:text-sm sm:text-base">
                          <Building2 className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                          {subscription.schoolName}
                        </div>
                        <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                          Auto-renewal:{" "}
                          {subscription.autoRenewal ? "Enabled" : "Disabled"}
                        </div>
                        <div className="sm:hidden space-y-1 mt-2">
                          <div className="flex items-center gap-1">
                            {getPlanBadge(subscription.plan)}
                            <span className="font-medium text-green-600 text-[0.85rem] xs:text-xs sm:text-sm">
                              {subscription.price}
                            </span>
                          </div>
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm">
                            {subscription.startDate} to {subscription.endDate}
                          </div>
                          <div
                            className={`text-[0.85rem] xs:text-xs sm:text-sm ${getExpiryColor(
                              getDaysUntilExpiry(subscription.endDate)
                            )}`}>
                            {getDaysUntilExpiry(subscription.endDate) > 0
                              ? `${getDaysUntilExpiry(
                                  subscription.endDate
                                )} days left`
                              : `${Math.abs(
                                  getDaysUntilExpiry(subscription.endDate)
                                )} days overdue`}
                          </div>
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm">
                            {subscription.paymentMethod}
                          </div>
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                            Last: {subscription.lastPayment}
                          </div>
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                            Next: {subscription.nextBilling}
                          </div>
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm">
                            {subscription.students} students
                          </div>
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm">
                            {subscription.teachers} teachers
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(subscription.status)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {getPlanBadge(subscription.plan)}
                        <div className="font-medium text-green-600 text-xs xs:text-sm">
                          {subscription.price}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="text-xs xs:text-sm">
                          {subscription.startDate} to {subscription.endDate}
                        </div>
                        <div
                          className={`text-xs xs:text-sm ${getExpiryColor(
                            getDaysUntilExpiry(subscription.endDate)
                          )}`}>
                          {getDaysUntilExpiry(subscription.endDate) > 0
                            ? `${getDaysUntilExpiry(
                                subscription.endDate
                              )} days left`
                            : `${Math.abs(
                                getDaysUntilExpiry(subscription.endDate)
                              )} days overdue`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="text-xs xs:text-sm">
                          {subscription.paymentMethod}
                        </div>
                        <div className="text-xs xs:text-sm text-muted-foreground">
                          Last: {subscription.lastPayment}
                        </div>
                        <div className="text-xs xs:text-sm text-muted-foreground">
                          Next: {subscription.nextBilling}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="text-xs xs:text-sm">
                          {subscription.students} students
                        </div>
                        <div className="text-xs xs:text-sm">
                          {subscription.teachers} teachers
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(subscription.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSubscription(subscription)}
                          className="p-1 xs:p-2">
                          <Edit className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 xs:p-2 text-red-600 hover:text-red-700"
                          onClick={() =>
                            handleDeleteSubscription(subscription)
                          }>
                          <Trash2 className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
              {Array.from({length: totalPages}, (_, index) => index + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <CreditCard className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {subscriptions.length}
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              {subscriptions.filter((s) => s.status === "Active").length} active
              subscriptions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">
              ₦2,450,000
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Premium Plans
            </CardTitle>
            <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {subscriptions.filter((s) => s.plan === "Premium").length}
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              {Math.round(
                (subscriptions.filter((s) => s.plan === "Premium").length /
                  subscriptions.length) *
                  100
              )}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Overdue Payments
            </CardTitle>
            <AlertTriangle className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-red-600">
              {subscriptions.filter((s) => s.status === "Overdue").length}
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Edit Subscription
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Update subscription details
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-3 xs:gap-4 py-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    School Name
                  </Label>
                  <Input
                    defaultValue={selectedSubscription.schoolName}
                    disabled
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Subscription Plan
                  </Label>
                  <Select
                    defaultValue={selectedSubscription.plan.toLowerCase()}>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="basic"
                        className="text-xs xs:text-sm sm:text-base">
                        Basic Plan
                      </SelectItem>
                      <SelectItem
                        value="premium"
                        className="text-xs xs:text-sm sm:text-base">
                        Premium Plan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    defaultValue={selectedSubscription.startDate}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    End Date
                  </Label>
                  <Input
                    type="date"
                    defaultValue={selectedSubscription.endDate}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Payment Method
                  </Label>
                  <Select
                    defaultValue={selectedSubscription.paymentMethod
                      .toLowerCase()
                      .replace(" ", "")}>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="banktransfer"
                        className="text-xs xs:text-sm sm:text-base">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem
                        value="cardpayment"
                        className="text-xs xs:text-sm sm:text-base">
                        Card Payment
                      </SelectItem>
                      <SelectItem
                        value="cash"
                        className="text-xs xs:text-sm sm:text-base">
                        Cash Payment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Auto Renewal
                  </Label>
                  <Select
                    defaultValue={
                      selectedSubscription.autoRenewal ? "yes" : "no"
                    }>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="yes"
                        className="text-xs xs:text-sm sm:text-base">
                        Yes
                      </SelectItem>
                      <SelectItem
                        value="no"
                        className="text-xs xs:text-sm sm:text-base">
                        No
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                alert("Subscription updated successfully!");
              }}
              className="text-xs xs:text-sm sm:text-base">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Delete Subscription
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Are you sure you want to delete the subscription for{" "}
              {selectedSubscription?.schoolName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="text-xs xs:text-sm sm:text-base">
              Delete Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
