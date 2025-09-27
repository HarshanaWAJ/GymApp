import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstance from '../api/axiosInstance';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('all');
  const [tabIndex, setTabIndex] = useState(0);
  const [comparisonMode, setComparisonMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const sidebarWidth = 200;

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axiosInstance.get('/payment/');
        setSales(response.data);
      } catch (err) {
        setError('Failed to fetch sales data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const filterSales = (list) =>
    list.filter((sale) =>
      sale.card_holder.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const groupedSales = sales.reduce((groups, sale) => {
    const date = new Date(sale.createdAt);
    const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(sale);
    return groups;
  }, {});

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
    const monthlyTotal = sales
      .filter((sale) => new Date(sale.createdAt).getFullYear() === selectedYear)
      .filter((sale) => new Date(sale.createdAt).getMonth() === i)
      .reduce((sum, s) => sum + s.payment, 0);
    return { name: monthName, total: monthlyTotal };
  });

  const yearlyTotals = sales.reduce((years, sale) => {
    const year = new Date(sale.createdAt).getFullYear();
    if (!years[year]) years[year] = 0;
    years[year] += sale.payment;
    return years;
  }, {});

  const yearlyData = Object.entries(yearlyTotals)
    .sort(([a], [b]) => b - a)
    .map(([year, total]) => ({ year, total }));

  const availableYears = [...new Set(sales.map(s => new Date(s.createdAt).getFullYear()))].sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const currentMonth = new Date().getMonth();

  const currentYearSales = sales.filter(sale => new Date(sale.createdAt).getFullYear() === currentYear);
  const lastYearSales = sales.filter(sale => new Date(sale.createdAt).getFullYear() === lastYear);

  const currentMonthSales = sales.filter(
    sale =>
      new Date(sale.createdAt).getFullYear() === currentYear &&
      new Date(sale.createdAt).getMonth() === currentMonth
  );

  const calcSummary = (salesList) => {
    const total = salesList.reduce((sum, s) => sum + s.payment, 0);
    const transactions = salesList.length;
    const highest = salesList.reduce((max, s) => (s.payment > max ? s.payment : max), 0);
    const average = transactions ? total / transactions : 0;
    return { total, transactions, highest, average };
  };

  const currentYearSummary = calcSummary(currentYearSales);
  const lastYearSummary = calcSummary(lastYearSales);
  const currentMonthSummary = calcSummary(currentMonthSales);

  // Report Download
    const downloadCurrentMonthReport = () => {
        const doc = new jsPDF();
        const monthName = new Date().toLocaleString('default', { month: 'long' });
        const reportTitle = `Sales Report - ${monthName} ${currentYear}`;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 14, 20);

        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

        // Table Columns
        const tableColumn = ['Card Holder', 'Card Number', 'Date', 'Payment ($)'];
        const tableRows = [];

        // Table Rows
        currentMonthSales.forEach((sale) => {
            tableRows.push([
            sale.card_holder,
            `**** **** **** ${sale.card_number.slice(-4)}`,
            new Date(sale.createdAt).toLocaleDateString(),
            sale.payment.toFixed(2),
            ]);
        });

        // Summary Row (bold total row)
        const totalRow = [
            'TOTAL',
            '',
            '',
            currentMonthSummary.total.toFixed(2),
        ];
        tableRows.push(totalRow);

        autoTable(doc, {
            startY: 36,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: {
            fontSize: 10,
            cellPadding: 4,
            valign: 'middle',
            },
            headStyles: {
            fillColor: [25, 118, 210],
            textColor: 255,
            fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: function (data) {
            if (data.row.index === tableRows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [25, 118, 210];
                data.cell.styles.fillColor = [230, 230, 250];
            }
            },
        });

        // Add summary box below table
        const summaryStartY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Summary', 14, summaryStartY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);

        const summaryData = [
            [`Total Sales:`, `$${currentMonthSummary.total.toFixed(2)}`],
            [`Total Transactions:`, `${currentMonthSummary.transactions}`],
            [`Highest Payment:`, `$${currentMonthSummary.highest.toFixed(2)}`],
            [`Average Payment:`, `$${currentMonthSummary.average.toFixed(2)}`],
        ];

        summaryData.forEach(([label, value], i) => {
            doc.text(label, 14, summaryStartY + 8 + i * 6);
            doc.text(value, 80, summaryStartY + 8 + i * 6);
        });

        // Save
        doc.save(`Sales_Report_${currentYear}_${currentMonth + 1}.pdf`);
        };

  return (
    <Box sx={{ display: 'flex' }}>
      <StoreAdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: `${sidebarWidth}px` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ mb: 2 }}>
            <button onClick={downloadCurrentMonthReport} style={{
                padding: '10px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}>
                Download Current Month Report (PDF)
            </button>
            </Box>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Sales History
        </Typography>

        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ mb: 2 }}>
          <Tab label="Analysis" />
          <Tab label="History" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : tabIndex === 0 ? (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Comparison Mode</InputLabel>
                <Select
                  value={comparisonMode}
                  label="Comparison Mode"
                  onChange={(e) => setComparisonMode(e.target.value)}
                >
                  <MenuItem value="monthly">Monthly (in Year)</MenuItem>
                  <MenuItem value="yearly">Yearly Comparison</MenuItem>
                </Select>
              </FormControl>

              {comparisonMode === 'monthly' && (
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {availableYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Paper sx={{ flex: 1, p: 3, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  {comparisonMode === 'monthly'
                    ? `Monthly Sales in ${selectedYear}`
                    : 'Yearly Sales Comparison'}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={comparisonMode === 'monthly' ? monthlyData : yearlyData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={comparisonMode === 'monthly' ? 'name' : 'year'} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Paper sx={{ flex: 1, p: 3, minWidth: 300, maxWidth: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Summary Comparison (Current Year vs Last Year)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff' }}></TableCell>
                        <TableCell sx={{ color: '#fff' }}>
                          Current Year ({currentYear})
                        </TableCell>
                        <TableCell sx={{ color: '#fff' }}>
                          Last Year ({lastYear})
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Sales</TableCell>
                        <TableCell>${currentYearSummary.total.toFixed(2)}</TableCell>
                        <TableCell>${lastYearSummary.total.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Transactions</TableCell>
                        <TableCell>{currentYearSummary.transactions}</TableCell>
                        <TableCell>{lastYearSummary.transactions}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Highest Payment</TableCell>
                        <TableCell>${currentYearSummary.highest.toFixed(2)}</TableCell>
                        <TableCell>${lastYearSummary.highest.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Average Payment</TableCell>
                        <TableCell>${currentYearSummary.average.toFixed(2)}</TableCell>
                        <TableCell>${lastYearSummary.average.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            {/* Current Month Summary Display */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current Month Summary ({new Date().toLocaleString('default', { month: 'long' })} {currentYear})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Sales</TableCell>
                      <TableCell>${currentMonthSummary.total.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Transactions</TableCell>
                      <TableCell>{currentMonthSummary.transactions}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Highest Payment</TableCell>
                      <TableCell>${currentMonthSummary.highest.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Payment</TableCell>
                      <TableCell>${currentMonthSummary.average.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                label="Search by Card Holder"
                value={searchTerm}
                fullWidth
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  label="Group By"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {groupBy === 'all' ? (
              filterSales(sales).length === 0 ? (
                <Alert severity="info">No matching sales found.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff' }}>Card Holder</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Card Number</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Date</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Payment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filterSales(sales).map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell>{sale.card_holder}</TableCell>
                          <TableCell>**** **** **** {sale.card_number.slice(-4)}</TableCell>
                          <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>${sale.payment.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          ${filterSales(sales).reduce((sum, s) => sum + s.payment, 0).toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : (
              Object.entries(groupedSales)
                .sort((a, b) => new Date(b[1][0].createdAt) - new Date(a[1][0].createdAt))
                .map(([monthYear, salesList]) => {
                  const filtered = filterSales(salesList);
                  if (filtered.length === 0) return null;
                  const subtotal = filtered.reduce((sum, s) => sum + s.payment, 0);
                  return (
                    <Box key={monthYear} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>{monthYear}</Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#fff' }}>Card Holder</TableCell>
                              <TableCell sx={{ color: '#fff' }}>Card Number</TableCell>
                              <TableCell sx={{ color: '#fff' }}>Date</TableCell>
                              <TableCell sx={{ color: '#fff' }}>Payment</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filtered.map((sale) => (
                              <TableRow key={sale._id}>
                                <TableCell>{sale.card_holder}</TableCell>
                                <TableCell>**** **** **** {sale.card_number.slice(-4)}</TableCell>
                                <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>${sale.payment.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                Total for {monthYear}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>
                                ${subtotal.toFixed(2)}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default SalesHistory;
