import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const DataTable = ({ data }) => {
  console.log(data)
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Region</TableCell>
            <TableCell>Province</TableCell>
            <TableCell>City</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
         {data.map((row) => (
          <TableRow>
            <TableCell>{row.region}</TableCell>
            <TableCell>{row.province}</TableCell>
            <TableCell>{row.city}</TableCell>
          </TableRow>
         ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DataTable
