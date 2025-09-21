import { Component, OnInit } from '@angular/core';
import { AnalyticsService, ProductSalesDTO, OrderStatusDistributionDTO } from '../analytics.service'; // Import ProductSalesDTO and OrderStatusDistributionDTO
import { Chart, registerables, ChartOptions, ChartConfiguration, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { User } from '../../shared/models/user.model';
import { OrderStatus } from '../../shared/models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DailyRevenueDTO } from '../../shared/models/daily-revenue.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule]
})
export class AdminDashboardComponent implements OnInit {
  // Removed monthlySalesChart: Chart | undefined;
  monthlyRevenueChart: Chart | undefined;
  topSellingProductsChart: Chart | undefined;
  orderStatusChart: Chart | undefined;
  newCustomersChart: Chart | undefined;
  orderStatusByDateChart: Chart | undefined;
  brandSalesChart: Chart | undefined;

  totalUsers: number = 0;
  totalProducts: number = 0;
  totalOrders: number = 0;
  totalRevenue: number = 0;

  orderStatuses = Object.values(OrderStatus);
  startDate: string = '';
  endDate: string = '';
  selectedBrandSalesDate: string = ''; // New property for brand sales date filter
date: string = '';

  selectedMonth: string = '';
  availableMonths: { value: string, viewValue: string }[] = [];

  private orderStatusColors: string[] = [
    'rgba(255, 99, 132, 0.6)', // PENDING
    'rgba(54, 162, 235, 0.6)', // PROCESSING
    'rgba(255, 206, 86, 0.6)', // SHIPPED
    'rgba(75, 192, 192, 0.6)', // DELIVERED
    'rgba(153, 102, 255, 0.6)', // RETURNED
    'rgba(255, 159, 64, 0.6)'  // CANCELLED
  ];

  // Base Chart Options
  baseChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: any, context: any) => `${value}`,
        font: {
          weight: 'bold'
        }
      }
    }
  };

  // Removed Bar Chart (Monthly Sales) properties

  // Doughnut Chart Options for Brand Sales
  brandSalesDoughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
    },
  };

  // Pie Chart (Top Selling Products)
  pieChartOptions: ChartOptions = {
    ...this.baseChartOptions,
    plugins: {
      ...this.baseChartOptions.plugins,
      datalabels: {
        formatter: (value: any, ctx: any) => {
          const label = ctx.chart.data.labels?.[ctx.dataIndex] ?? '';
          const dataArr = ctx.chart.data.datasets[0].data as number[] || [];
          const total = dataArr.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
          const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(2) + '%' : '0%';
          return `${label}\n${percentage}`;
        },
        color: '#fff',
      }
    }
  };
  pieChartData: ChartConfiguration['data'] = { labels: [], datasets: [{ data: [], backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'] }] };
  pieChartType: ChartType = 'doughnut';
  pieChartPlugins = [ChartDataLabels];

  // Line Chart (Revenue Over Time - assuming this was the original line chart)
  lineChartOptions: ChartOptions = {
    ...this.baseChartOptions,
  };
  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenue',
      borderColor: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };
  lineChartType: ChartType = 'line';


  constructor(private analyticsService: AnalyticsService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.generateAvailableMonths();
    this.loadMonthlyRevenue();
    this.loadTopSellingProducts();
    this.loadOrderStatusDistribution();
    this.loadNewCustomersLast7Days();
    this.loadTotalUsers();
    this.loadOrdersByStatusAndDate();
    this.getTotalProducts();
    this.getTotalOrders();
    this.getTotalRevenue();
    this.loadBrandSalesData(); // This line should call it
  }

  loadBrandSalesData(): void {
    console.log('loadBrandSalesData called');
    this.analyticsService.getTopSellingBrands().subscribe(data => {
      console.log('Data from getTopSellingBrands:', data);
      const labels = data.map(d => d.brand);
      const sales = data.map(d => d.totalSales);
      this.renderBrandSalesChart(labels, sales);
    });
  }

  loadBrandSalesDataByDate(): void {
    console.log('loadBrandSalesDataByDate called');
    this.analyticsService.getTopSellingBrands(this.date).subscribe(data => {
      console.log('Data from getBrandSalesByDate:', data);
      const labels = data.map(d => d.brand);
      const sales = data.map(d => d.totalSales);
      this.renderBrandSalesChart(labels, sales);
    });
  }


  renderBrandSalesChart(labels: string[], data: number[]): void {
    console.log('renderBrandSalesChart called');
    console.log('Labels:', labels);
    console.log('Data:', data);
    const chartId = 'brandSalesChart';
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (!ctx) {
      console.error('Canvas element with ID "brandSalesChart" not found.');
      return;
    }
    console.log('Canvas context (ctx):', ctx);

    if (this.brandSalesChart) {
      this.brandSalesChart.data.labels = labels;
      this.brandSalesChart.data.datasets[0].data = data;
      this.brandSalesChart.update();
    } else {
      this.brandSalesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Brand Sales',
            data: data,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#7FFF00', '#DC143C', '#00FFFF'
            ],
            hoverOffset: 4
          }]
        },
        options: this.brandSalesDoughnutChartOptions as any
      }) as any;
    }
  }

  generateAvailableMonths(): void {
    const today = new Date();
    for (let i = 0; i < 12; i++) { // Generate last 12 months
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const viewValue = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      this.availableMonths.push({ value, viewValue });
    }
    this.selectedMonth = this.availableMonths[0].value; // Set current month as default
  }

  onMonthChange(): void {
    this.loadMonthlyRevenue();
  }

  loadMonthlyRevenue(): void {
    this.analyticsService.getMonthlyRevenue(this.selectedMonth).subscribe((data: DailyRevenueDTO[]) => {
      const labels = data.map(item => item.date);
      const revenues = data.map(item => item.revenue);
      console.log('Monthly Revenue Labels:', labels);
      console.log('Monthly Revenue Data:', revenues);
      this.renderMonthlyRevenueChart(labels, revenues);
    });
  }

  renderMonthlyRevenueChart(labels: string[], data: number[]): void {
    const chartId = 'monthlyRevenueChart';
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (this.monthlyRevenueChart) {
      this.monthlyRevenueChart.data.labels = labels;
      this.monthlyRevenueChart.data.datasets[0].data = data;
      this.monthlyRevenueChart.update();
    } else {
      this.monthlyRevenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            label: 'Monthly Revenue',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: this.lineChartOptions as any
      }) as any;
    }
  }

  getTotalRevenue() {
    this.analyticsService.getTotalRevenue().subscribe(total => {
      this.totalRevenue = total;
    });
  }

  // Removed loadMonthlySales(): void { ... }

  loadTopSellingProducts(): void {
    this.analyticsService.getTopSellingProducts().subscribe((data: ProductSalesDTO[]) => {
      const labels = data.map((item: ProductSalesDTO) => item.productName);
      const quantities = data.map((item: ProductSalesDTO) => item.totalQuantitySold);
      this.renderTopSellingProductsChart(labels, quantities);
    });
  }


  loadOrderStatusDistribution(): void {
    this.analyticsService.getOrderStatusDistribution().subscribe((data: OrderStatusDistributionDTO[]) => {
      const labels = data.map((item: OrderStatusDistributionDTO) => item.status);
      const counts = data.map((item: OrderStatusDistributionDTO) => item.count);
      this.renderOrderStatusChart(labels, counts);
    });
  }

  loadNewCustomersLast7Days(): void {
    this.analyticsService.getNewCustomersLast7Days().subscribe(users => {
      const { labels, data } = this.processNewCustomersData(users);
      this.renderNewCustomersChart(labels, data);
    });
  }

  loadTotalUsers(): void {
    this.analyticsService.getTotalUsers().subscribe(total => {
      this.totalUsers = total;
    });
  }

  loadOrdersByStatusAndDate(): void {
    const statusObservables = this.orderStatuses.map(status =>
      this.analyticsService.getOrdersByStatusAndDate(
        status,
        this.startDate || undefined,
        this.endDate || undefined
      )
    );

    forkJoin(statusObservables).subscribe(counts => {
      this.renderOrdersByStatusAndDateChart(this.orderStatuses, counts);
    });
  }

  processNewCustomersData(users: User[]): { labels: string[], data: number[] } {
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())); // Get today's date in UTC

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setUTCDate(today.getUTCDate() - 6); // Go back 6 days from today to include today (7 days total)

    console.log('Calculating new customers data (UTC):');
    console.log('Today (UTC normalized):', today.toISOString().split('T')[0]);
    console.log('Seven days ago (UTC normalized):', sevenDaysAgo.toISOString().split('T')[0]);

    const dailyCounts: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setUTCDate(sevenDaysAgo.getUTCDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyCounts[dateString] = 0;
      console.log('Initialized dailyCounts for (UTC):', dateString);
    }

    console.log('Initial dailyCounts:', dailyCounts);

    users.forEach(user => {
      const registrationDate = new Date(user.createdAt);
      // Convert registrationDate to UTC date string for consistent comparison
      const dateString = new Date(Date.UTC(registrationDate.getFullYear(), registrationDate.getMonth(), registrationDate.getDate())).toISOString().split('T')[0];
      console.log('Processing user created on:', user.createdAt, '-> normalized UTC date:', dateString);
      if (dailyCounts[dateString] !== undefined) {
        dailyCounts[dateString]++;
        console.log('Incremented count for:', dateString, '; new count:', dailyCounts[dateString]);
      } else {
        console.log('Date not in last 7 days range (UTC):', dateString);
      }
    });

    console.log('Final dailyCounts:', dailyCounts);

    const labels = Object.keys(dailyCounts).sort();
    const data = labels.map(label => dailyCounts[label]);

    return { labels, data };
  }

  // Removed renderMonthlySalesChart(labels: string[], data: number[]): void { ... }

  renderTopSellingProductsChart(labels: string[], data: number[]): void {
    const chartId = 'topSellingProductsChart';
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (this.topSellingProductsChart) {
      this.topSellingProductsChart.data.labels = labels;
      this.topSellingProductsChart.data.datasets[0].data = data;
      this.topSellingProductsChart.update();
    } else {
      this.topSellingProductsChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Top Selling Products',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: this.pieChartOptions as any
      }) as any;
    }
  }

  renderOrderStatusChart(labels: string[], data: number[]): void {
    const chartId = 'orderStatusChart';
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (this.orderStatusChart) {
      this.orderStatusChart.data.labels = labels;
      this.orderStatusChart.data.datasets[0].data = data;
      this.orderStatusChart.update();
    } else {
      this.orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Order Status Distribution',
            data: data,
            backgroundColor: [
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(255, 159, 64, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: this.pieChartOptions as any
      }) as any;
    }
  }

  renderNewCustomersChart(labels: string[], data: number[]): void {
    const chartId = 'newCustomersChart';
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (this.newCustomersChart) {
      this.newCustomersChart.data.labels = labels;
      this.newCustomersChart.data.datasets[0].data = data;
      this.newCustomersChart.update();
    } else {
      this.newCustomersChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'New Customers Last 7 Days',
            data: data,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }
  }

  renderOrdersByStatusAndDateChart(labels: OrderStatus[], data: number[]): void {
    const chartId = 'orderStatusByDateChart';
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (this.orderStatusByDateChart) {
      this.orderStatusByDateChart.data.labels = labels;
      this.orderStatusByDateChart.data.datasets[0].data = data;
      this.orderStatusByDateChart.update();
    } else {
      this.orderStatusByDateChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Orders by Status',
            data: data,
            backgroundColor: this.orderStatusColors,
            borderColor: this.orderStatusColors.map(color => color.replace('0.6', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      }) as any;
    }
  }

  getTotalProducts(): void {
    this.analyticsService.getTotalProducts().subscribe(total => {
      this.totalProducts = total;
    });
  }
  getTotalOrders(): void {
    this.analyticsService.getTotalSales().subscribe(total => {
      this.totalOrders = total;
    });
  }

  downloadPdf(): void {
    const data = document.getElementById('contentToConvert');
    if (data) {
      html2canvas(data).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('admin-dashboard.pdf');
      });
    }
  }

}

/* Removed local forkJoin definition; using rxjs forkJoin instead */


