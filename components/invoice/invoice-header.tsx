import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle, Plus, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function InvoiceHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoice Management</h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Pro
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Create, track, and manage professional invoices with comprehensive analytics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-10 w-64 bg-background/50 backdrop-blur" />
              </div>
              <Button variant="outline" size="sm" className="hover-lift bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hover-lift bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="hover-lift bg-transparent">
                <AlertCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
              <Button size="sm" className="hover-lift">
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
