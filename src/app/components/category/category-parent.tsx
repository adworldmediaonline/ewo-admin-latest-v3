import React from "react";
import ErrorMsg from "../common/error-msg";
import { FieldErrors, UseFormRegister } from "react-hook-form";

// prop type
type IPropType = {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  default_value?: string;
};

const CategoryParent = ({ register, errors, default_value }: IPropType) => {
  return (
    <div className="space-y-2">
      <input
        {...register("parent", {
          required: `Parent is required!`,
        })}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        type="text"
        name="parent"
        placeholder="Enter category name"
        defaultValue={default_value && default_value}
      />
      <ErrorMsg msg={(errors?.parent?.message as string) || ""} />
    </div>
  );
};

export default CategoryParent;
