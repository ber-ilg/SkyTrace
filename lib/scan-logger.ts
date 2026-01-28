// Scan logging and error tracking for debugging

export interface ScanLog {
  emailId: string;
  subject: string;
  from?: string;
  date?: string;
  status: 'success' | 'skipped' | 'failed' | 'no_flight_data';
  reason?: string;
  extractedData?: any;
}

export class ScanLogger {
  private logs: ScanLog[] = [];
  
  log(entry: ScanLog) {
    this.logs.push(entry);
  }
  
  getSummary() {
    const total = this.logs.length;
    const success = this.logs.filter(l => l.status === 'success').length;
    const skipped = this.logs.filter(l => l.status === 'skipped').length;
    const failed = this.logs.filter(l => l.status === 'failed').length;
    const noFlightData = this.logs.filter(l => l.status === 'no_flight_data').length;
    
    return {
      total,
      success,
      skipped,
      failed,
      noFlightData,
      successRate: total > 0 ? ((success / total) * 100).toFixed(1) : '0.0',
    };
  }
  
  getUnparseableEmails() {
    return this.logs.filter(l => l.status === 'no_flight_data' || l.status === 'failed');
  }
  
  getSuccessfulExtractions() {
    return this.logs.filter(l => l.status === 'success');
  }
  
  getAllLogs() {
    return this.logs;
  }
}
