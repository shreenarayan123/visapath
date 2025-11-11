import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { PersonalInfo } from '@/types';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  currentLocation: z.string().min(1, 'Current location is required'),
  professionalSummary: z.string().min(50, 'Professional summary must be at least 50 characters').max(500, 'Professional summary must be less than 500 characters'),
});

interface Step1PersonalProps {
  onNext: () => void;
}

export const Step1Personal = ({ onNext }: Step1PersonalProps) => {
  const { state, updatePersonalInfo } = useEvaluationContext();

  const form = useForm<PersonalInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: state.personalInfo,
  });

  const onSubmit = (data: PersonalInfo) => {
    updatePersonalInfo(data);
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Personal Information</h2>
        <p className="text-muted-foreground">Tell us about yourself to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Location *</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, USA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="professionalSummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Summary *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your professional background, expertise, and career highlights..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/500 characters (minimum 50)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="min-w-[120px]">
              Next →
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
