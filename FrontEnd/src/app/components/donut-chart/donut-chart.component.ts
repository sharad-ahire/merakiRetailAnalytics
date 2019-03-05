import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js'
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';

@Component({
  selector: 'donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit {

  constructor(private http: HttpClient) { }
  public chartType: string = "doughnut";
  public chartLabels: Array<string> = ['Total Checkouts','Total Visitors'];
  public chartLabels2: Array<string> = ['1', '2', '3', '4', '5', '6', '7','8'];
  public chartData: Array<string> = [];
  public chartData2: Array<number> = [350, 150, 100, 45, 23, 12, 16, 70];
  public colorOptions: Array<any> = [
    {
      backgroundColor: ["rgba(175, 122, 197,0.4)",
        "rgba(100, 123, 20, 0.4)",
        "rgba(255, 20, 100, 0.4)",
        "rgba(255, 140, 120, 0.4)",
        "rgba(124, 22, 10, 0.4)",
        "rgba(80, 20, 222, 0.4)",
        "rgba(149, 210, 10, 0.4)",
        "rgba(55, 210, 255, 0.4)"],
      hoverBackgroundColor: ['rgba(175, 122, 197,1)', "rgba(100, 123, 20, 1)", "rgba(255, 20, 100, 1)"]
    }
  ];

  zoneData: any;
  zoneLabels: any;


  public chartOptions: any = {
    maintainAspectRatio: true,
    cutoutPercentage: 56,
    responsive: true,
    legend: {
      display: true,
    },
    tooltips: {
      enabled: true,
    }
  }

  salesDonutChartUpdate(data) {
    this.chartData=[];
    this.chartData=data;
  }

  zoneDonutChartUpdate(data){
    this.chartData2=[];
    this.chartData2=data;
  }

  ngOnInit() {
    //Total Transactions
    this.http.get('http://localhost:4004/api/v0/meraki/posSimulator/totalTransactions')
      .subscribe(res => {
      this.chartData=[];
      this.chartData.push(res[0].count);

      this.http.get('http://localhost:4004/api/v0/meraki/scanning/visitorCountByDate')
      .subscribe(res => {
        this.chartData.push(res[0].count);
        
        this.salesDonutChartUpdate(this.chartData);
      })
        
      });

      Observable
      interval(1000).subscribe(() =>
      this.http.get('http://localhost:4004/api/v0/meraki/camera/currentVisitorsPerZone')
      .subscribe(res => {
        this.chartData2=[];
        this.zoneData = res;
        for(let i of this.zoneData){
          this.chartData2.push(i.count)
        }
        this.zoneDonutChartUpdate(this.chartData2);
      })
      )

      // this.http.get('http://localhost:4004/api/v0/meraki/camera/currentVisitorsPerZone')
      // .subscribe(res => {
      //   this.chartLabels2 = [];
      //   this.zoneLabels = res;
      //   for(let i of this.zoneLabels){
      //     this.chartLabels2.push(i.)
      //   }
      // })

    }

  }

