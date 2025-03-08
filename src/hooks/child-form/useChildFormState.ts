
import { useState, useEffect } from "react";
import { Child } from "@/types";
import { ChildFormData } from "../useChildForm";

export const useChildFormState = (selectedChild: Child | null) => {
  const [formData, setFormData] = useState<ChildFormData>({
    name: selectedChild?.name || "",
    birth_date: selectedChild?.birth_date || "",
    age: selectedChild?.age || 0,
    location: selectedChild?.location || "",
    story: selectedChild?.story || "",
    school_id: selectedChild?.school_id || "",
    grade: selectedChild?.grade || "",
    image_url: selectedChild?.image_url || null,
    status: selectedChild?.status || "pending",
    priority: selectedChild?.priority || null,
  });

  useEffect(() => {
    if (selectedChild) {
      console.log('Setting form data from selected child:', selectedChild);
      setFormData({
        name: selectedChild.name || "",
        birth_date: selectedChild.birth_date || "",
        age: selectedChild.age || 0,
        location: selectedChild.location || "",
        story: selectedChild.story || "",
        school_id: selectedChild.school_id || "",
        grade: selectedChild.grade || "",
        image_url: selectedChild.image_url || null,
        status: selectedChild.status || "pending",
        priority: selectedChild.priority || null,
      });
    } else {
      setFormData({
        name: "",
        birth_date: "",
        age: 0,
        location: "",
        story: "",
        school_id: "",
        grade: "",
        image_url: null,
        status: "pending",
        priority: null,
      });
    }
  }, [selectedChild]);

  return { formData, setFormData };
};
