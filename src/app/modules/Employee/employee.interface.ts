export type CreateUserInput = {
  email: string;
  name: string;
  contactNo: string;
  designation: string;
  profileImage: string;
  role: string;
  powerId: number[];
};

export type IEmployeeFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNo?: string | undefined;
  role?: string | undefined;
};
