
// React & Hooks
import { useEffect, useState } from "react";

// Types
import type { TCustomInputWrapper } from "@/@types/form/field-config.type";

// Components
import { AppComboBox } from "@/components/layout-ui/app-combo-box";

// Hooks
import { useSearchableResource } from "@/hooks/use-searchable";


export interface UserInputPropsWrapperProps<T> extends TCustomInputWrapper {
    multiple?: boolean;
    modal?: boolean;
    useSearchable: () => ReturnType<typeof useSearchableResource<T>>;
    getLabel: (item: T) => string;
    getKey: (item: T) => string;
    getValue: (item: T) => any;
    shouldFilter?: boolean
}

export const SearchableInputWrapper = <T,>({
    value,
    onChange,
    disabled,
    multiple = false,
    modal = false,
    useSearchable,
    getLabel,
    getKey,
    getValue,
    shouldFilter = true
}: UserInputPropsWrapperProps<T>) => {

    const { response, isLoading, error, setFilters } = useSearchable();
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters({ search });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);


    return (
        <AppComboBox<T>
            value={multiple ? (value || []) : (value ?? "")}
            getValue={getValue}
            onChange={onChange}
            items={(response?.data || [])}
            loading={isLoading}
            error={error?.message || null}
            getKey={getKey}
            getLabel={getLabel}
            search={search}
            onSearchChange={setSearch}
            placeholder={"Select..."}
            multiple={multiple}
            modal={modal}
            disabled={disabled}
            shouldFilter={shouldFilter}
        />
    );
};