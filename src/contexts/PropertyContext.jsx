import { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as necessary

const PropertyContext = createContext();

export const useProperty = () => useContext(PropertyContext);

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch properties from Firestore
        const propertiesCollection = collection(db, 'Properties');
        const propertiesSnapshot = await getDocs(propertiesCollection);

        // Map Firestore documents to an array of property objects
        const propertiesData = propertiesSnapshot.docs.map(doc => ({
          id: doc.id, // Include the document ID
          ...doc.data() // Include all other fields
        }));

        // Update state with fetched properties
        setProperties(propertiesData);

        // Filter featured properties
        const featured = propertiesData.filter(property => property.featured);
        setFeaturedProperties(featured);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const getPropertyById = (id) => {
    return properties.find(property => property.id === id) || null;
  };

  const searchProperties = (filters) => {
    // Add search to history
    if (filters && Object.keys(filters).length > 0) {
      setSearchHistory(prev => [
        { id: Date.now(), filters, timestamp: new Date() },
        ...prev.slice(0, 9) // Keep only the 10 most recent searches
      ]);
    }

    // Apply filters
    return properties.filter(property => {
      let match = true;

      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        match = false;
      }

      if (filters.minPrice && property.price < filters.minPrice) {
        match = false;
      }

      if (filters.maxPrice && property.price > filters.maxPrice) {
        match = false;
      }

      if (filters.propertyType && property.type !== filters.propertyType) {
        match = false;
      }

      if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
        match = false;
      }

      if (filters.bathrooms && property.bathrooms < filters.bathrooms) {
        match = false;
      }

      return match;
    });
  };

  const toggleSaveProperty = (propertyId) => {
    setSavedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  // const getSavedProperties = () => {
  //   return properties.filter(property => savedProperties.includes(property.id));
  // };

  // const addProperty = async (property) => {
  //   try {
  //     // Add new property to Firestore
  //     const docRef = await addDoc(collection(db, 'Properties'), property);
  //     console.log('Document written with ID: ', docRef.id);

  //     // Update local state
  //     const newProperty = { ...property, id: docRef.id };
  //     setProperties(prev => [...prev, newProperty]);
  //     return newProperty;
  //   } catch (error) {
  //     console.error('Error adding property:', error);
  //   }
  // };

  // const updateProperty = async (id, updates) => {
  //   try {
  //     // Update property in Firestore
  //     const propertyRef = doc(db, 'Properties', id);
  //     await updateDoc(propertyRef, updates);

  //     // Update local state
  //     setProperties(prev =>
  //       prev.map(property =>
  //         property.id === id ? { ...property, ...updates } : property
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error updating property:', error);
  //   }
  // };

  // const deleteProperty = async (id) => {
  //   try {
  //     // Delete property from Firestore
  //     const propertyRef = doc(db, 'Properties', id);
  //     await deleteDoc(propertyRef);

  //     // Update local state
  //     setProperties(prev => prev.filter(property => property.id !== id));
  //   } catch (error) {
  //     console.error('Error deleting property:', error);
  //   }
  // };

  const value = {
    properties,
    featuredProperties,
    loading,
    savedProperties,
    searchHistory,
    getPropertyById,
    searchProperties,
    toggleSaveProperty,
    // getSavedProperties,
    // addProperty,
    // updateProperty,
    // deleteProperty
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};