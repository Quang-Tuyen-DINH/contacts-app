"use client";

import { useNotify } from '@/providers/Notification.provider';
import { Contact } from '@/shared/models/Contact.model';
import { useEffect } from 'react';
import "../../../styles/contacts/_component/ContactCreateUpdateForm.scss"
import { type SubmitHandler, useForm, type UseFormRegister } from "react-hook-form";
import { api } from '@/lib/api';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  job: string;
  email: string;
  comment: string;
}

type CreateUpdateContactInputData = {
  label: string,
  type: string,
  name: string,
  pattern: string,
  placeHolder: string
}

type InputComponentProps = {
  data: CreateUpdateContactInputData;
  register: UseFormRegister<ContactFormValues>;
}

type ContactCreateUpdateFormProps = {
  contactToBeUpdated: Contact | null;
}

const checkoutFormData: CreateUpdateContactInputData[] = [
  {
    label: "Last name",
    type: "text",
    name: "lastName",
    pattern: "[a-zA-Z][a-zA-Z ]+",
    placeHolder: "Last name without special characters"
  },
  {
    label: "First name",
    type: "text",
    name: "firstName",
    pattern: "[a-zA-Z][a-zA-Z ]+",
    placeHolder: "First name without special characters"
  },
  {
    label: "Email",
    type: "text",
    name: "email",
    pattern: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$",
    placeHolder: "Ex: email@abc.com"
  },
  {
    label: "Job",
    type: "text",
    name: "job",
    pattern: "[a-zA-Z][a-zA-Z ]+",
    placeHolder: "Ex: Engineer"
  },
  {
    label: "Comment",
    type: "text",
    name: "comment",
    pattern: "[a-zA-Z][a-zA-Z ]+",
    placeHolder: "Ex: Leave a comment"
  }
];

const InputComponent = ({ data, register }: InputComponentProps) => {
  return (
    <label>
      {data.label}
      <input
        type={data.type}
        placeholder={data.placeHolder}
        {...register(data.name as keyof ContactFormValues, { required: true, pattern: new RegExp(data.pattern) })}
      />
    </label>
  )
}

const ContactCreateUpdateForm = ({
  contactToBeUpdated
}: ContactCreateUpdateFormProps) => {
  const notify = useNotify();
  const router = useRouter();
  const { setValue, trigger, register, handleSubmit, setFocus, formState, reset } = useForm<ContactFormValues>({ mode: "onChange" });
  const { isValid } = formState;

  const handlePreFillInputs = (contact: Contact) => {
    if (contact.lastName) setValue("lastName", contact.lastName);
    if (contact.firstName) setValue("firstName", contact.firstName);
    if (contact.email) setValue("email", contact.email);
    if (contact.job) setValue("job", contact.job);
    if (contact.comment) setValue("comment", contact.comment);
  }

  const handleCancel = () => router.push('/contacts');

  const onSubmit: SubmitHandler<ContactFormValues> = (data) => {
    if (contactToBeUpdated) {
      handleSubmitUpdate(contactToBeUpdated._id, data);
    } else {
      handleSubmitCreate(data)
    }

    reset();
  }
  
  const handleSubmitCreate = async (data: ContactFormValues) => {
    try {
      await fetch(api("/contacts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      notify({ type: "addContact", label: data.lastName });
      handleCancel();
    } catch (err) {
      notify({ type: "errorUnexpected", label: JSON.stringify(err) });
      console.error(err);
    }
  }

  const handleSubmitUpdate = async (id: string, data: ContactFormValues) => {
    try {
      await fetch(`${api("/contacts")}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      notify({ type: "updateContact", label: data.lastName });
      handleCancel();
    } catch (err) {
      notify({ type: "errorUnexpected", label: JSON.stringify(err) });
      console.error(err);
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
                <InputComponent data={data} register={register} />
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
