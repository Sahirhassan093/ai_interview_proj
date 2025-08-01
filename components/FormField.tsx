import React from "react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    placeholder?: string;
    control: Control<T>;
    type?: 'text' | 'email' | 'password' | 'file';
}

const FormField = ({control, name ,label, placeholder,type='text'}: FormFieldProps<T> ) =>(
    <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="label">{label}</FormLabel>
                    <FormControl>
                        <Input className="input" placeholder={placeholder}
                        type={type}
                        {...field} />
                    </FormControl>
                    <FormDescription>
                        
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
    />
            )

export default FormField;