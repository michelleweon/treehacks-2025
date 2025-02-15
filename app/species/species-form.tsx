// Import necessary components and utilities
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input, type InputProps } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"
import { type UseFormReturn } from "react-hook-form"
import { type FormData, kingdoms } from "./species-schema"
import { Form } from "@/components/ui/form"

// Define props for the `SpeciesForm` component
interface SpeciesFormProps {
  form: UseFormReturn<FormData> // react-hook-form instance for managing form state
  onSubmit: (e: React.BaseSyntheticEvent) => void // Function to handle form submission
  submitLabel: string // Label for the submit button (e.g., "Add Species" or "Edit Species")
}

// Main `SpeciesForm` component
export function SpeciesForm({ form, onSubmit, submitLabel }: SpeciesFormProps) {

  // Helper function to render text fields (Input or Textarea)
  const renderTextField = (
    name: keyof FormData, // Field name in the form schema
    label: string, // Label for the field
    placeholder: string, // Placeholder text for the field
    Component: typeof Input | typeof Textarea = Input, // Component type (Input by default)
    props: Partial<InputProps & TextareaProps > = {} // Additional props to pass to the component
  ) => (
    <FormField
      control={form.control} // Connects the field to react-hook-form's control object
      name={name} // Field name in the form schema
      render={({ field }) => {
        const { value, ...rest } = field // Destructure field properties provided by react-hook-form
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel> {/* Display the label */}
            <FormControl>
              <Component
                value={value ?? ""} // Set the value (default to an empty string if null/undefined)
                placeholder={placeholder} // Set placeholder text
                {...rest} // Spread other react-hook-form field properties (e.g., `onChange`, `onBlur`)
                {...props} // Spread additional props passed to the function
              />
            </FormControl>
            <FormMessage /> {/* Display validation error messages */}
          </FormItem>
        )
      }}
    />
  )

  return (
    <Form {...form}> {/* Wrap the form with react-hook-form's `Form` component */}
      <form onSubmit={onSubmit}> {/* Handle form submission */}
        <div className="grid w-full items-center gap-4">
          {/* Render a text input for "Scientific Name" */}
          {renderTextField(
            "scientific_name",
            "Scientific Name",
            "Cavia porcellus"
          )}

          {/* Render a text input for "Common Name" */}
          {renderTextField(
            "common_name",
            "Common Name",
            "Guinea pig"
          )}

          {/* Render a select dropdown for "Kingdom" */}
          <FormField
            control={form.control}
            name="kingdom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kingdom</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(kingdoms.parse(value))} // Parse and update value using zod schema validation
                  value={field.value} // Current value of the field
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a kingdom" /> {/* Placeholder text */}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {/* Map over kingdom options and render each as a dropdown item */}
                      {kingdoms.options.map((kingdom) => (
                        <SelectItem key={kingdom} value={kingdom}>
                          {kingdom}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage /> {/* Display validation error messages */}
              </FormItem>
            )}
          />

          {/* Render a numeric input for "Total Population" */}
          {renderTextField(
            "total_population",
            "Total Population",
            "300000",
            Input,
            {
              type: "number", // Set input type to number
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                form.setValue("total_population", +e.target.value); // Convert string input to number and update form state
            }
          }
          )}

          {/* Render a text input for "Image URL" */}
          {renderTextField(
            "image",
            "Image URL",
            "https://example.com/image.jpg"
          )}

          {/* Render a textarea for "Description" */}
          {renderTextField(
            "description",
            "Description",
            "Enter species description...",
            Textarea
          )}

          {/* Render action buttons (Submit and Cancel) */}
          <div className="flex gap-3">
            {/* Submit button */}
            <Button type="submit" className="flex-1">
              {submitLabel} {/* Dynamic label based on props */}
            </Button>

            {/* Cancel button to close the dialog */}
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </form>
    </Form>
  )
}
