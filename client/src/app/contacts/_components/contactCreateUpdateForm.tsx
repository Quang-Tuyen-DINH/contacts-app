"use client";

import { useNotify } from '@/providers/Notification.provider';
import { Contact } from '@/shared/models/Contact.model';
import { useEffect } from 'react';
import "../../../styles/contacts/_component/ContactCreateUpdateForm.scss"
import { FieldErrors, type SubmitHandler, useForm, type UseFormRegister } from "react-hook-form";
import { api } from '@/lib/api';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  job: string;
  email: string;
  comment?: string;
}

type CreateUpdateContactInputData = {
  label: string,
  type: string,
  name: keyof ContactFormValues,
  required: boolean,
  pattern?: RegExp,
  error?: string,
  placeHolder: string
}

type InputComponentProps = {
  data: CreateUpdateContactInputData;
  register: UseFormRegister<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
}

type ContactCreateUpdateFormProps = {
  contactToBeUpdated: Contact | null;
}

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/;
const jobPattern = /^[A-Za-z0-9 '().,\-]{2,100}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const commentPattern = /^.{0,150}$/ // allow up to 150 characters

const checkoutFormData: CreateUpdateContactInputData[] = [
  {
    label: "Last name",
    type: "text",
    name: "lastName",
    required: true,
    pattern: namePattern,
    error: "Please enter a valid last name",
    placeHolder: "Last name without special characters"
  },
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
    pattern: namePattern,
    error: "Please enter a valid first name",
    placeHolder: "First name without special characters"
  },
  {
    label: "Email",
    type: "text",
    name: "email",
    required: true,
    pattern: emailPattern,
    error: "Please enter a valid email address",
    placeHolder: "Ex: email@abc.com"
  },
  {
    label: "Job",
    type: "text",
    name: "job",
    required: true,
    pattern: jobPattern,
    error: "Please enter a valid job title",
    placeHolder: "Ex: Engineer"
  },
  {
    label: "Comment",
    type: "text",
    name: "comment",
    required: false,
    pattern: commentPattern,
    error: "Comment must be 300 characters or fewer",
    placeHolder: "Ex: Leave a comment"
  }
];

const InputComponent = ({ data, register, errors }: InputComponentProps) => {
  const id = `field-${String(data.name)}`;
  const err = errors[data.name];
  const errorMsg = typeof err?.message === "string" ? err.message : undefined;

  return (
    <label htmlFor={id}>
      {data.label}
      <input
        id={id}
        type={data.type}
        placeholder={data.placeHolder}
        aria-invalid={!!err || undefined}
        aria-describedby={errorMsg ? `${id}-error` : undefined}
        {...register(data.name as keyof ContactFormValues, {
          required: true,
          ...(data.pattern ? { pattern: { value: data.pattern, message: data.error || "Invalid value" } } : {})
        })}
      />
    </label>
  )
}

const ContactCreateUpdateForm = ({
  contactToBeUpdated
}: ContactCreateUpdateFormProps) => {
  const notify = useNotify();
  const router = useRouter();
  const { setValue, trigger, register, handleSubmit, setFocus, formState, reset } = useForm<ContactFormValues>({
    mode: "onChange",
    defaultValues: { firstName: "", lastName: "", email: "", job: "", comment: "" }
  });
  const { isValid, isSubmitting, errors } = formState;

  const handlePreFillInputs = (contact: Contact) => {
    if (contact.lastName) setValue("lastName", contact.lastName);
    if (contact.firstName) setValue("firstName", contact.firstName);
    if (contact.email) setValue("email", contact.email);
    if (contact.job) setValue("job", contact.job);
    if (contact.comment) setValue("comment", contact.comment);
  }

  const handleCancel = () => router.push('/contacts');

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    if (contactToBeUpdated) {
      await handleSubmitUpdate(contactToBeUpdated._id, data);
    } else {
      await handleSubmitCreate(data);
    }

    reset();
  }
  
  const handleSubmitCreate = async (data: ContactFormValues): Promise<boolean> => {
    try {
      const res = await fetch(api("/contacts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const isJSON = (res.headers.get("content-type") || "").includes("application/json");
      const body = isJSON ? await res.json() : await res.text();

      if (!res.ok) {
        if (res.status === 409) {
          notify({ type: "errorUnexpected", label: "Email already exists" });
        } else if (res.status === 400) {
          const msg = typeof body === "object" && body?.error ? body.error : "Validation failed";
          notify({ type: "errorUnexpected", label: msg });
        } else {
          notify({ type: "errorUnexpected", label: `HTTP ${res.status}` });
        }
        return false;
      }

      notify({ type: "addContact", label: data.lastName });
      handleCancel();
      return true;
    } catch (err) {
      notify({ type: "errorUnexpected", label: JSON.stringify(err) });
      console.error(err);
      return false;
    }
  }

  const handleSubmitUpdate = async (id: string, data: ContactFormValues) => {
    try {
      const res = await fetch(`${api("/contacts")}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const isJSON = (res.headers.get("content-type") || "").includes("application/json");
      const body = isJSON ? await res.json() : await res.text();

      if (!res.ok) {
        if (res.status === 409) {
          notify({ type: "errorUnexpected", label: "Email already exists" });
        } else if (res.status === 400) {
          const msg = typeof body === "object" && body?.error ? body.error : "Validation failed";
          notify({ type: "errorUnexpected", label: msg });
        } else if (res.status === 404) {
          notify({ type: "errorUnexpected", label: "Contact not found" });
        } else {
          notify({ type: "errorUnexpected", label: `HTTP ${res.status}` });
        }
        return false;
      }

      notify({ type: "updateContact", label: data.lastName });
      handleCancel();
      return true;
    } catch (err) {
      notify({ type: "errorUnexpected", label: JSON.stringify(err) });
      console.error(err);
      return false;
    }
  }

  useEffect(() => {
    setFocus(checkoutFormData[0].name as keyof ContactFormValues);
  }, []);

  useEffect(() => {
    if (contactToBeUpdated) {
      handlePreFillInputs(contactToBeUpdated);
      trigger();
    }
  }, [contactToBeUpdated]);
  
  return (
    <div className="contact-create-update-form-container">
        <form className="contact-create-update-form-container__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="contact-create-update-form-container__form__inputs-container">
            {checkoutFormData.map((data: CreateUpdateContactInputData) => (
              <div key={`input-${data.name}`} className="contact-create-update-form-container__form__inputs-container__input">
                <InputComponent data={data} register={register} errors={errors} />
              </div>
            ))}
          </div>
          <div className="contact-create-update-form-container__form__buttons">
              <Button
                type="button"
                className="contact-create-update-form-container__form__button__cancel"
                variant="outlined" size="small" color="primary"
                onClick={handleCancel}
              >
                  Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                className="contact-create-update-form-container__form__button__confirm"
                variant="outlined" size="small" color="primary"
              >
                Confirm
              </Button>
          </div>
        </form>
    </div>
  )
}

export default ContactCreateUpdateForm
