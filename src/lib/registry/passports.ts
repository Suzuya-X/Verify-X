// The official record format stored in our synthetic registry
export type RegistryPassport = {
  documentType?: string;
  documentNumber: string;
  surname: string;
  givenName: string;
  dateOfBirth: string;
  nationality: string;
  sex: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
};

// A synthetic local database of authorized passport records
export const syntheticPassportRegistry: RegistryPassport[] = [
  {
    documentNumber: 'P1234567',
    surname: 'Sharma',
    givenName: 'Rahul',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfIssue: '2022-06-13',
    dateOfExpiry: '2032-06-12',
    status: 'ACTIVE'
  },
  {
    documentNumber: 'P8392014',
    surname: 'Das',
    givenName: 'Ananya',
    dateOfBirth: '2001-03-21',
    nationality: 'IND',
    sex: 'F',
    dateOfIssue: '2021-11-10',
    dateOfExpiry: '2031-11-09',
    status: 'ACTIVE'
  },
  {
    documentNumber: 'P5518239',
    surname: 'Patel',
    givenName: 'Arjun',
    dateOfBirth: '1999-12-04',
    nationality: 'IND',
    sex: 'M',
    dateOfIssue: '2015-02-19',
    dateOfExpiry: '2025-02-18',
    status: 'EXPIRED'
  },
  {
    documentNumber: 'P4729106',
    surname: 'Nair',
    givenName: 'Priya',
    dateOfBirth: '2000-07-16',
    nationality: 'IND',
    sex: 'F',
    dateOfIssue: '2020-08-20',
    dateOfExpiry: '2030-08-19',
    status: 'ACTIVE'
  },
  {
    documentNumber: 'P6843201',
    surname: 'Singh',
    givenName: 'Vikram',
    dateOfBirth: '1998-11-29',
    nationality: 'IND',
    sex: 'M',
    dateOfIssue: '2019-04-15',
    dateOfExpiry: '2029-04-14',
    status: 'ACTIVE'
  },
  {
    documentType: 'passport',
    documentNumber: 'VX1234567',
    surname: 'SHARMA',
    givenName: 'RAHUL',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfIssue: '2022-06-13',
    dateOfExpiry: '2032-06-12',
    status: 'ACTIVE'
  }
];
