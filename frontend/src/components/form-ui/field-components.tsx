import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useId, useMemo, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/layout-ui/app-select";
import { DatePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker } from "@/components/form-ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { EORDER_CLASSES } from "@/enums/general.enum";
import type { TFieldConfig } from "@/@types/form/field-config.type";

// Smart FormFieldWrapper that handles all field types
export const FormFieldWrapper = React.memo(function FormFieldWrapper({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical",
    children
}: BaseFieldProps & { children: (props: { field: any, isDisabled: boolean }) => React.ReactNode }) {
    const values = useWatch();
    const { isVisible, isDisabled } = getFieldState(field, values);

    if (!isVisible) return null;

    return (
        <FormField
            key={fieldName}
            name={fieldName}
            render={({ field: controllerField }) => (
                <FormItem>
                    <div
                        className={cn(
                            "gap-2 flex",
                            layout === "vertical" ? "flex-col justify-center" : "items-center"
                        )}
                    >
                        {field.label && (
                            <FormLabel className={`text-muted-foreground ${field.lableOrder || EORDER_CLASSES.First}`}>
                                {field.label}
                                {showRequiredAsterisk && field.required && <span className="text-red-500">*</span>}
                            </FormLabel>
                        )}

                        <FormControl className={field.lableOrder === EORDER_CLASSES.First ? "flex-1" : ""}>
                            <div className="relative">
                                {field.startAdornment && <div className="absolute left-3 top-2.5 flex items-center pointer-events-none">{field.startAdornment}</div>}
                                {children({ field: controllerField, isDisabled })}
                                {field.endAdornment && <div className="absolute right-3 top-2.5 flex items-center">{field.endAdornment}</div>}
                            </div>
                        </FormControl>
                    </div>
                    <FormMessage />
                    {field.bottomAdornment && <FormDescription>{field.bottomAdornment}</FormDescription>}
                </FormItem>
            )}
        />
    );
});

interface BaseFieldProps<T = any> {
    field: TFieldConfig<T>;
    fieldName: string;
    showRequiredAsterisk?: boolean;
    layout?: "vertical" | "horizontal";
}

// Helper function to get field visibility and disabled state
const getFieldState = (field: any, values: any) => {
    const isVisible = field.visible ? field.visible({ values }) : true;
    const isDisabled = typeof field.disabled === "function" ? field.disabled({ values }) : field.disabled;
    return { isVisible, isDisabled };
};

export const TextField = React.memo(function TextField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (value: any) => {
        field?.onChange?.(value);
        return value;
    };

    const commonClass = cn(
        field.startAdornment && "pl-10",
        field.endAdornment && "pr-10",
        field.className
    );

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {
                return (
                    <Input
                        {...controllerField}
                        value={controllerField.value}
                        type={field.type}
                        onChange={(e) => controllerField.onChange(onChangeHandler(e.target.value))}
                        placeholder={field.placeholder}
                        disabled={isDisabled}
                        className={commonClass}
                    />
                );
            }}
        </FormFieldWrapper>
    );
});

export const TextareaField = React.memo(function TextareaField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (value: any) => {
        field?.onChange?.(value);
        return value;
    };

    const commonClass = cn(
        field.startAdornment && "pl-10",
        field.endAdornment && "pr-10",
        field.className
    );

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {

                return (
                    <Textarea
                        {...controllerField}
                        onChange={(e) => controllerField.onChange(onChangeHandler(e.target.value))}
                        placeholder={field.placeholder}
                        disabled={isDisabled}
                        className={commonClass}
                    />
                );
            }}
        </FormFieldWrapper>
    );
});

export const SelectField = React.memo(function SelectField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (value: any) => {
        field?.onChange?.(value);
        return value;
    };

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {

                return (
                    <AppSelect
                        value={controllerField.value}
                        onChange={(value: any) => controllerField.onChange(onChangeHandler(value))}
                        options={field.options ?? []}
                        multiple={field.type === "multiSelect"}
                        disabled={isDisabled}
                        modal={true}
                    />
                );
            }}
        </FormFieldWrapper>
    );
});

export const SwitchField = React.memo(function SwitchField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {

                return (
                    <Switch
                        checked={controllerField.value}
                        onCheckedChange={controllerField.onChange}
                        disabled={isDisabled}
                    />
                );
            }}
        </FormFieldWrapper>
    );
});

export const RadioField = React.memo(function RadioField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (value: any) => {
        field?.onChange?.(value);
        return value;
    };

    const options = field.options || [];

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {
                return (
                    <RadioGroup
                        value={controllerField.value?.toString()}
                        onValueChange={(value) => {
                            // Convert value based on field type or let the field handle it
                            const processedValue = onChangeHandler(value);
                            controllerField.onChange(processedValue);
                        }}
                        disabled={isDisabled}
                        className={cn("flex gap-4", field.className)}
                    >
                        {options.map((option: any) => {
                            const optionValue = typeof option === "object" ? option.value : option;
                            const optionLabel = typeof option === "object" ? option.label : option;
                            const valueStr = optionValue?.toString();

                            return (
                                <div key={valueStr} className="flex items-center space-x-2">
                                    <RadioGroupItem value={valueStr} id={`${fieldName}-${valueStr}`} />
                                    <Label
                                        htmlFor={`${fieldName}-${valueStr}`}
                                        className="font-normal cursor-pointer"
                                    >
                                        {optionLabel}
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>
                );
            }}
        </FormFieldWrapper>
    );
});

export const DateField = React.memo(function DateField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (value: any) => {
        field?.onChange?.(value);
        return value;
    };

    const commonClass = cn(
        field.startAdornment && "pl-10",
        field.endAdornment && "pr-10",
        field.className
    );

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {

                return field.type === "date" || field.type === "dateRange" ? (
                    <DatePicker
                        value={controllerField.value}
                        onChange={(date) => controllerField.onChange(onChangeHandler(date))}
                        placeholder={field.placeholder || "Select date"}
                        disabled={isDisabled}
                        className={commonClass}
                    />
                ) : (
                    <DateTimePicker
                        value={controllerField.value}
                        onChange={(date) => controllerField.onChange(onChangeHandler(date))}
                        placeholder={field.placeholder || "Select date & time"}
                        disabled={isDisabled}
                        className={commonClass}
                    />
                );
            }}
        </FormFieldWrapper>
    );
});

export const DateRangeField = React.memo(function DateRangeField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (dateRange: any) => {
        field?.onChange?.(dateRange);
        return dateRange;
    };

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => (
                <DateRangePicker
                    value={controllerField.value}
                    onChange={(dateRange) => controllerField.onChange(onChangeHandler(dateRange))}
                    placeholder={field.placeholder}
                    disabled={isDisabled}
                    className={field.className}
                />
            )}
        </FormFieldWrapper>
    );
});

export const DateTimeRangeField = React.memo(function DateTimeRangeField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (dateTimeRange: any) => {
        field?.onChange?.(dateTimeRange);
        return dateTimeRange;
    };

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => (
                <DateTimeRangePicker
                    value={controllerField.value}
                    onChange={(dateTimeRange) => controllerField.onChange(onChangeHandler(dateTimeRange))}
                    placeholder={field.placeholder}
                    disabled={isDisabled}
                    className={field.className}
                />
            )}
        </FormFieldWrapper>
    );
});

export const CustomField = React.memo(function CustomField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (value: any) => {
        field?.onChange?.(value);
        return value;
    };

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => {
                return field.Component ? <field.Component
                    value={controllerField.value}
                    onChange={(value) => controllerField.onChange(onChangeHandler(value))}
                    disabled={isDisabled} /> : null;
            }}
        </FormFieldWrapper>
    );
});

export const FileField = React.memo(function FileField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (file: File | null) => {
        field?.onChange?.(file);
        return file;
    };

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => (
                <Input
                    type="file"
                    disabled={isDisabled}
                    onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        const result = onChangeHandler(file);
                        controllerField.onChange(result);
                    }}
                    className={cn(field.className)}
                />
            )}
        </FormFieldWrapper>
    );
});

export const MultiFileField = React.memo(function MultiFileField({
    field,
    fieldName,
    showRequiredAsterisk,
    layout = "vertical"
}: BaseFieldProps) {
    const onChangeHandler = (files: File[]) => {
        field?.onChange?.(files);
        return files;
    };

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ field: controllerField, isDisabled }) => (
                <Input
                    type="file"
                    multiple
                    disabled={isDisabled}
                    onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        const result = onChangeHandler(files);
                        controllerField.onChange(result);
                    }}
                    className={cn(field.className)}
                />
            )}
        </FormFieldWrapper>
    );
});

interface UseObjectFieldProps<T> extends BaseFieldProps<T> {
    renderField: (field: any, parentName?: string) => any;
}


export function useObjectField<T>({
    field,
    fieldName,
    renderField,
    showRequiredAsterisk,
    layout = "vertical"
}: UseObjectFieldProps<T>) {

    const commonClass = cn(
        field.startAdornment && "pl-10",
        field.endAdornment && "pr-10",
        field.className
    );

    const renderItem = field.renderItem;

    const item = renderField(field.subFields, `${fieldName}`);

    return (
        <FormFieldWrapper
            field={field}
            fieldName={fieldName}
            showRequiredAsterisk={showRequiredAsterisk}
            layout={layout}
        >
            {({ isDisabled }) => {
                return (
                    <div className={cn(isDisabled && "opacity-50 pointer-events-none", commonClass)}>

                        {renderItem ? renderItem(item) : Object.keys(item).map((key) => item[key])}
                    </div>
                );
            }}
        </FormFieldWrapper>
    );
}

interface UseArrayFieldProps<T> extends BaseFieldProps<T> {
    renderField: (field: any, parentName?: string) => any;
}




export function useArrayField<T>({
    field,
    fieldName,
    renderField,
    showRequiredAsterisk,
    layout = "vertical"
}: UseArrayFieldProps<T>) {
    const { control } = useFormContext();

    const maxItems = field.maxItems || 10;
    const minItems = field.minItems || 0;
    const RemoveButton = field.RemoveButton;
    const renderItem = field.renderItem;

    const { fields, append, remove } = useFieldArray({
        control,
        name: fieldName,
    });

    useEffect(() => {
        if (minItems > 0 && fields.length < minItems) {
            const missing = minItems - fields.length;
            for (let i = 0; i < missing; i++) append({} as T);
        }
    }, [fields.length, minItems, append]);

    const addItem = () => {

        if (maxItems && fields.length >= maxItems) return;
        append({} as T);
    };

    const removeItem = (index: number) => {
        if (minItems && fields.length <= minItems) return;
        remove(index);
    };

    const commonClass = cn(
        field.startAdornment && "pl-10",
        field.endAdornment && "pr-10",
        field.className
    );

    const AddButton = field.AddButton ?
        <field.AddButton type="button" onClick={addItem} /> :
        <Button type="button" onClick={addItem}>Add</Button>
        ;

    const removeButton = RemoveButton ?
        ((index: number) => <RemoveButton type="button" onClick={() => removeItem(index)} index={index} />) :
        ((index: number) => <Button type="button" onClick={() => removeItem(index)}>Remove</Button>)
        ;

    const items = fields.map((_, index) => {
        return renderField(field.subFields, `${fieldName}.${index}`);

    });

    return <FormFieldWrapper
        field={field}
        fieldName={fieldName}
        showRequiredAsterisk={showRequiredAsterisk}
        layout={layout}
    >
        {({ isDisabled }) => {
            return (
                <div className={cn(isDisabled && "opacity-50 pointer-events-none", commonClass)}>
                    {renderItem ? (
                        renderItem(items, AddButton, removeButton)
                    ) : items.length > 0 ? (
                        items.map((item, index) => (
                            <div className="flex items-end gap-2" key={fields[index].id}>
                                {typeof item === "object" && !React.isValidElement(item)
                                    ? Object.keys(item).map((key) => (
                                        <div key={key}>{item[key]}</div>
                                    ))
                                    : item}
                                {minItems > 0 && index > 0 && removeButton(index)}
                                {index < maxItems - 1 && index === items.length - 1 && AddButton}
                            </div>
                        ))
                    ) : (
                        AddButton
                    )}
                </div>

            );
        }}
    </FormFieldWrapper>
}

// Export DateRangePicker and DateTimeRangePicker for use in other components
export { DateRangePicker, DateTimeRangePicker };