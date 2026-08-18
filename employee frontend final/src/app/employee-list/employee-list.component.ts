import { Component } from '@angular/core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent {

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  EnteredID!: number;

  // Search and filter values
  searchText: string = '';
  selectedDepartment: string = '';
  selectedDesignation: string = '';

  // Dropdown options
  departments: string[] = [];
  designations: string[] = [];

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 5;          // employees shown per page
  currentPage = 1;       // current page number
  totalPages = 1;        // total number of pages

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.employeeService.getEmployeesList().subscribe(data => {

      this.employees = data;

      // Initially show all employees
      this.filteredEmployees = data;
      this.updateTotalPages();

      // Get unique departments
      this.departments = [
        ...new Set(
          data
            .map(employee => employee.department)
            .filter(department => department)
        )
      ];

      // Get unique designations
      this.designations = [
        ...new Set(
          data
            .map(employee => employee.designation)
            .filter(designation => designation)
        )
      ];
    });
  }

  get paginatedEmployees() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;

  return this.filteredEmployees.slice(startIndex, endIndex);
}

  updateTotalPages() {
  this.totalPages = Math.ceil(
    this.filteredEmployees.length / this.pageSize
  );
}

  nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

  previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

  goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

  // Search + filter employees
  applyFilters() {

    const search = this.searchText.toLowerCase().trim();

    this.filteredEmployees = this.employees.filter(employee => {

      const matchesSearch =
        !search ||
        employee.id.toString().includes(search) ||
        employee.fname.toLowerCase().includes(search) ||
        employee.lname.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search);

      const matchesDepartment =
        !this.selectedDepartment ||
        employee.department === this.selectedDepartment;

      const matchesDesignation =
        !this.selectedDesignation ||
        employee.designation === this.selectedDesignation;

      return matchesSearch &&
             matchesDepartment &&
             matchesDesignation;
    });

    this.updateTotalPages();
    this.currentPage = 1;
  }

  sortEmployees(column: string) {
  console.log('SORT CLICKED:', column);  
  if (this.sortColumn === column) {
    this.sortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.filteredEmployees = [...this.filteredEmployees].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if (column === 'name') {
      valueA = `${a.fname} ${a.lname}`.toLowerCase();
      valueB = `${b.fname} ${b.lname}`.toLowerCase();
    } else {
      valueA = a[column as keyof typeof a];
      valueB = b[column as keyof typeof b];
    }

    if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;

    return 0;
  });
}

  // Clear all filters
  clearFilters() {
    this.searchText = '';
    this.selectedDepartment = '';
    this.selectedDesignation = '';

    this.filteredEmployees = this.employees;
    this.updateTotalPages();
  }

  goToEmployee() {
    console.log(this.EnteredID);
    this.router.navigate(['details-of-employee', this.EnteredID]);
  }

  updateEmployee(id: number) {
    this.router.navigate(['updating-by-id', id]);
  }

  deleteEmployee(id: number) {

    if (confirm("Are you sure to delete Employee ID: " + id)) {

      this.employeeService.deleteEmployee(id).subscribe(data => {

        console.log(data);
        this.getEmployees();

      });
    }
  }

  detailsOfEmployee(id: number) {
    this.router.navigate(['details-of-employee', id]);
  }
}