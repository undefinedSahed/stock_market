"use client" // Add "use client" as we will use client-side states here

import PersonalDetails from '@/components/Portfolio/my-acccount/personal-details'
import ProfileInfo from '@/components/Portfolio/my-acccount/profile-info'
import React, { useState } from 'react'

export default function Page() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // When selecting image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className='lg:w-[95%]'>
            <ProfileInfo
                selectedImage={selectedImage}
                imagePreview={imagePreview}
                handleImageChange={handleImageChange}
            />
            <PersonalDetails
                selectedImage={selectedImage}
                setImagePreview={setImagePreview}
            />
        </div>
    )
}