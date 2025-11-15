import React from 'react';
import { Box, Skeleton, Table, TableBody, TableCell, TableRow } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 8,
  columns = 5
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Table>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" width="100%" height={24} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default TableSkeleton;