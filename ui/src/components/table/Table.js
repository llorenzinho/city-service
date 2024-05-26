import React from 'react'
import {DataGrid} from '@mui/x-data-grid';

const columns = [
    { field: 'region', headerName: 'Region', flex: 1 },
    { field: 'name', headerName: 'City', flex: 1 },
    { field: 'code', headerName: 'City Code', flex: 0.4 },
    { field: 'province', headerName: 'Province', flex: 1 },
    { field: 'provinceCode', headerName: 'Province Code', flex: 0.4 },
    { field: 'section', headerName: 'Section', flex: 0.4 },
  ];


export default function DataTable({data}) {

  return (
    <div>
      <DataGrid
        rowSelection={false}
        rowSelectionModel={[]}
        getRowId={(row) => row._id}
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  )
}