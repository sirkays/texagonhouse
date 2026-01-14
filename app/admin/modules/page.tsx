"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  BookOpen,
  Clock,
  Loader2,
  AlertCircle,
  FilterX,
} from "lucide-react";
import { LessonsModal } from "@/components/admin/modals/lessons-modal";

interface Module {
  id: number;
  name: string;
  course: string;
  order: number;
  difficulty: string;
  lessons: number;
  duration: number;
  category: string;
  active: boolean;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

interface Course {
  id: number;
  name: string;
}

interface ApiResponse {
  results: Module[];
  pagination: Pagination;
  filters: {
    courses: Course[];
  };
}

export default function ModulesPage() {
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const fetchModules = useCallback(
    async (
      page: number = 1,
      search?: string,
      difficulty?: string,
      course?: string,
      status?: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (difficulty && difficulty !== "All")
          params.append("difficulty", difficulty.toUpperCase()); // Convert to uppercase for API
        if (course && course !== "All") params.append("course_id", course);
        if (status && status !== "All") params.append("status", status);
        params.append("page", page.toString());
        params.append("page_size", pageSize.toString());

        const response = await fetch(`/api/admin/modules?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Failed to fetch modules: ${response.status}`
          );
        }
        const data: ApiResponse = await response.json();
        setModules(data.results);
        setPagination(data.pagination);
        setCourses(data.filters.courses);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch modules"
        );
        setModules([]);
        setPagination({ page: 1, page_size: 20, total: 0 });
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModules(
        currentPage,
        searchTerm,
        difficultyFilter,
        courseFilter,
        statusFilter
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [
    fetchModules,
    currentPage,
    searchTerm,
    difficultyFilter,
    courseFilter,
    statusFilter,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
    setCurrentPage(1);
  };

  const handleCourseChange = (value: string) => {
    setCourseFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDifficultyFilter("All");
    setCourseFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDifficulty = (difficulty: string) => {
    return (
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
    );
  };

  const getStatusVariant = (active: boolean) => {
    return active ? "default" : "secondary";
  };

  const hasActiveFilters =
    searchTerm ||
    difficultyFilter !== "All" ||
    courseFilter !== "All" ||
    statusFilter !== "All";

  const totalPages = Math.ceil(pagination.total / pageSize);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Modules
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize course content into modules
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select
                  value={difficultyFilter}
                  onValueChange={handleDifficultyChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={courseFilter} onValueChange={handleCourseChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="flex items-center gap-2">
                  <FilterX className="h-4 w-4" />
                  Clear
                </Button>
              </div>

              {/* Active filters indicator */}
        {/* {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {difficultyFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Difficulty: {difficultyFilter.toLowerCase()}
                    </Badge>
                  )}
                  {courseFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Course:{" "}
                      {
                        courses.find((c) => c.id.toString() === courseFilter)
                          ?.name
                      }
                    </Badge>
                  )}
                  {statusFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>  */}

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    className="pl-9 w-full"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                <Select
                  value={difficultyFilter}
                  onValueChange={handleDifficultyChange}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={courseFilter} onValueChange={handleCourseChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <FilterX className="h-4 w-4" />
                  Clear
                </Button>
              </div>

              {/* Active filters indicator */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters:</span>

                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}

                  {difficultyFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Difficulty: {difficultyFilter.toLowerCase()}
                    </Badge>
                  )}

                  {courseFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Course:{" "}
                      {
                        courses.find((c) => c.id.toString() === courseFilter)
                          ?.name
                      }
                    </Badge>
                  )}

                  {statusFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading modules...</p>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        {!loading && modules.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className="hover:shadow-lg transition-shadow duration-200 border"
                >
                  <CardHeader className="pb-4">
                    {/* Added 'flex-wrap' and 'gap-y-2' to handle tiny screens */}
                    <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-medium shrink-0"
                      >
                        Module {module.order}
                      </Badge>
                      <div className="flex gap-1 shrink-0">
                        <Badge
                          className={`${getDifficultyColor(
                            module.difficulty
                          )} text-xs font-medium px-2 py-0.5`}
                        >
                          {formatDifficulty(module.difficulty)}
                        </Badge>
                        <Badge
                          variant={getStatusVariant(module.active)}
                          className="text-xs font-medium px-2 py-0.5"
                        >
                          {module.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <CardTitle className="text-lg leading-tight line-clamp-2 break-words">
                      {module.name}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-1 break-all">
                      {module.course}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Lessons Row */}
                      <div className="flex items-center gap-3 text-sm min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        {/* min-w-0 allows the text container to shrink below its content size */}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">
                            {module.lessons}{" "}
                            {module.lessons === 1 ? "Lesson" : "Lessons"}
                          </p>
                          <p
                            className="text-xs text-muted-foreground truncate"
                            title={module.category}
                          >
                            {module.category}
                          </p>
                        </div>
                      </div>

                      {/* Duration Row */}
                      <div className="flex items-center gap-3 text-sm min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">
                            {module.duration} minutes
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Estimated duration
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => setViewingModule(module)}
                      >
                        View Lessons
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  {/* Changed to flex-col on mobile, flex-row on small screens+ */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing {modules.length} of {pagination.total} modules •
                      Page {currentPage} of {totalPages}
                    </div>

                    {/* Buttons centered on mobile, right-aligned on desktop */}
                    <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none" // Make buttons easy to tap on mobile
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && modules.length === 0 && !error && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto max-w-md">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No modules found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first module."}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lessons Modal */}
      <LessonsModal
        open={!!viewingModule}
        onOpenChange={(open) => !open && setViewingModule(null)}
        moduleId={viewingModule?.id}
        moduleName={viewingModule?.name}
      />
    </>
  );
}
