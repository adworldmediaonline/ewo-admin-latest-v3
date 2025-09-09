import { SmClose } from '@/svg';
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Plus } from 'lucide-react';

interface FormData {
  key: string;
  value: string;
}

type IPropType = {
  setAdditionalInformation: React.Dispatch<
    SetStateAction<
      {
        key: string;
        value: string;
      }[]
    >
  >;
  default_value?: FormData[];
};

const AdditionalInformation = ({
  setAdditionalInformation,
  default_value,
}: IPropType) => {
  const [formData, setFormData] = useState<FormData[]>(
    default_value ? default_value : [{ key: '', value: '' }]
  );
  const [hasDefaultValues, setHasDefaultValues] = useState<boolean>(false);

  // default value set
  useEffect(() => {
    if (default_value && !hasDefaultValues) {
      setAdditionalInformation(default_value);
      setHasDefaultValues(true);
    }
  }, [default_value, hasDefaultValues, setAdditionalInformation]);
  // handle change field
  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[index] = { ...updatedFormData[index], [name]: value };
    setFormData(updatedFormData);
  };
  // handle add field
  const handleAddField = () => {
    const lastField = formData[formData.length - 1];
    if (lastField.key.trim() !== '' || lastField.value.trim() !== '') {
      setFormData([...formData, { key: '', value: '' }]);
      setAdditionalInformation([...formData]);
    }
  };
  // handleRemoveField
  const handleRemoveField = (index: number) => {
    const updatedFormData = [...formData];
    updatedFormData.splice(index, 1);
    setFormData(updatedFormData);
    setAdditionalInformation(updatedFormData);
  };

  return (
    <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Info className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Additional Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Add custom specifications, features, or any other product details
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.map((data, index) => {
          const col = index === 0 ? 'col-span-6' : 'col-span-5';
          return (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-6 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Key{' '}
                  {index === 0 && (
                    <span className="text-muted-foreground">
                      (e.g., Material, Size, Weight)
                    </span>
                  )}
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  name="key"
                  placeholder="Enter key"
                  value={data.key}
                  onChange={e => handleChange(index, e)}
                />
              </div>

              <div className={col + ' space-y-2'}>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Value{' '}
                  {index === 0 && (
                    <span className="text-muted-foreground">
                      (e.g., Cotton, Large, 200g)
                    </span>
                  )}
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  name="value"
                  placeholder="Enter value"
                  value={data.value}
                  onChange={e => handleChange(index, e)}
                />
              </div>

              {index > 0 && (
                <div className="col-span-1 space-y-2">
                  <label className="text-sm font-medium leading-none opacity-0">
                    Remove
                  </label>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    title="Remove field"
                  >
                    <SmClose className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-start pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddField}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
        </div>

        {formData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No additional information added yet.</p>
            <p className="text-xs mt-1">
              Click "Add Field" to add specifications or features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInformation;
