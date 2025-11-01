import React from "react";
import { UseFormRegister } from "react-hook-form";

const CategoryDescription = ({
  register,
  default_value
}: {
  register: UseFormRegister<any>;
  default_value?: string;
}) => {
  return (
    <div className="space-y-2">
      <textarea
        {...register("description", {
          required: false,
        })}
        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        placeholder="Enter category description (optional)"
        defaultValue={default_value && default_value}
      />
      <p className="text-xs text-muted-foreground">
        Provide a brief description of this category to help users understand its purpose.
      </p>
    </div>
  );
};

export default CategoryDescription;
