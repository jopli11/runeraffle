import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  getDashboardAnalytics,
  AnalyticsDashboardData,
  CompetitionStats
} from '../../services/analyticsService';
import { format } from 'date-fns';

// Styled components
const Container = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(12, 1fr);
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(6, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const StatCard = styled(Card)`
  grid-column: span 3;
  
  @media (max-width: 1024px) {
    grid-column: span 3;
  }
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const LargeCard = styled(Card)`
  grid-column: span 6;
  
  @media (max-width: 1024px) {
    grid-column: span 6;
  }
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const FullWidthCard = styled(Card)`
  grid-column: span 12;
  
  @media (max-width: 1024px) {
    grid-column: span 6;
  }
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div<{ isPrimary?: boolean }>`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${props => props.isPrimary ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: hsl(var(--muted-foreground));
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: hsl(var(--destructive));
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHead = styled.thead`
  background-color: hsl(var(--muted) / 0.5);
  border-bottom: 1px solid hsl(var(--border));
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: hsl(var(--foreground));
  white-space: nowrap;
`;

const TableBody = styled.tbody`
  & tr:nth-of-type(even) {
    background-color: hsl(var(--muted) / 0.3);
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.2s;
  
  &:hover {
    background-color: hsl(var(--muted) / 0.5);
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
`;

const Badge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => `hsl(${props.color} / 0.1)`};
  color: ${props => `hsl(${props.color})`};
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 1rem;
  position: relative;
`;

const HorizontalBar = styled.div<{ width: string; color?: string }>`
  height: 1.5rem;
  width: ${props => props.width};
  background-color: ${props => props.color || 'hsl(var(--primary))'};
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
  
  &::after {
    content: '${props => props.width}';
    position: absolute;
    right: 8px;
    top: 2px;
    color: white;
    font-size: 0.75rem;
  }
`;

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analyticsData = await getDashboardAnalytics();
        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <LoadingContainer>Loading analytics data...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  if (!data) {
    return <ErrorContainer>No data available</ErrorContainer>;
  }
  
  return (
    <Container>
      {/* Summary Stats */}
      <StatCard>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Stat>
            <StatValue isPrimary>{data.revenue.totalRevenue} credits</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </Stat>
        </CardContent>
      </StatCard>
      
      <StatCard>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Stat>
            <StatValue>{data.users.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </Stat>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>New (7 days):</span>
              <span style={{ fontWeight: 'bold' }}>{data.users.newUsersLast7Days}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>New (30 days):</span>
              <span style={{ fontWeight: 'bold' }}>{data.users.newUsersLast30Days}</span>
            </div>
          </div>
        </CardContent>
      </StatCard>
      
      <StatCard>
        <CardHeader>
          <CardTitle>Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          <Stat>
            <StatValue>{data.competitions.totalCompetitions}</StatValue>
            <StatLabel>Total Competitions</StatLabel>
          </Stat>
          <DataGrid style={{ marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>
                {data.competitions.activeCompetitions}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                Active
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>
                {data.competitions.completedCompetitions}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                Completed
              </div>
            </div>
          </DataGrid>
        </CardContent>
      </StatCard>
      
      <StatCard>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Stat>
            <StatValue>{data.tickets.totalTicketsSold}</StatValue>
            <StatLabel>Total Tickets Sold</StatLabel>
          </Stat>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last 7 days:</span>
              <span style={{ fontWeight: 'bold' }}>{data.tickets.ticketsSoldLast7Days}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>Last 30 days:</span>
              <span style={{ fontWeight: 'bold' }}>{data.tickets.ticketsSoldLast30Days}</span>
            </div>
          </div>
        </CardContent>
      </StatCard>
      
      {/* Popular Competitions */}
      <LargeCard>
        <CardHeader>
          <CardTitle>Most Popular Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Tickets Sold</TableHeaderCell>
                  <TableHeaderCell>Fill %</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {data.competitions.mostPopularCompetitions.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell>{comp.title}</TableCell>
                    <TableCell>{comp.ticketsSold}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HorizontalBar 
                          width={`${Math.min(100, Math.round(Math.random() * 100))}%`} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </LargeCard>
      
      {/* Recent Winners */}
      <LargeCard>
        <CardHeader>
          <CardTitle>Recent Completed Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Winner</TableHeaderCell>
                  <TableHeaderCell>End Date</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {data.competitions.recentlyEndedCompetitions.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell>{comp.title}</TableCell>
                    <TableCell>
                      <Badge color="var(--primary)">{comp.winner}</Badge>
                    </TableCell>
                    <TableCell>{format(comp.endDate, 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </LargeCard>
      
      {/* System Stats */}
      <FullWidthCard>
        <CardHeader>
          <CardTitle>System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid>
            <Stat>
              <StatValue>{data.system.conversionRate}%</StatValue>
              <StatLabel>Conversion Rate</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{data.system.averageCreditsPerUser}</StatValue>
              <StatLabel>Avg. Credits / User</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{data.tickets.averageTicketsPerUser}</StatValue>
              <StatLabel>Avg. Tickets / User</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{data.competitions.averageTicketsSold}</StatValue>
              <StatLabel>Avg. Tickets / Competition</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{data.system.totalSupportTickets}</StatValue>
              <StatLabel>Total Support Tickets</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{data.system.openSupportTickets}</StatValue>
              <StatLabel>Open Support Tickets</StatLabel>
            </Stat>
          </DataGrid>
        </CardContent>
      </FullWidthCard>
    </Container>
  );
} 