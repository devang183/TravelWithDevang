import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "";
    const limit = searchParams.get("limit") || "20";

    // Fetch attractions from Fáilte Ireland API
    const response = await fetch(
      `https://failteireland.azure-api.net/opendata-api/v2/attractions`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Fáilte Ireland API returned ${response.status}`);
    }

    const data = await response.json();
    let attractions = data.value || data || [];

    // Filter by city if provided - more flexible matching
    if (city) {
      const cityLower = city.toLowerCase();
      attractions = attractions.filter(attraction => {
        const region = attraction.location?.address?.addressRegion?.toLowerCase() || '';
        const locality = attraction.location?.address?.addressLocality?.toLowerCase() || '';
        const street = attraction.location?.address?.streetAddress?.toLowerCase() || '';
        const locationName = attraction.location?.name?.toLowerCase() || '';
        const attractionName = attraction.name?.toLowerCase() || '';
        
        return region.includes(cityLower) ||
               locality.includes(cityLower) ||
               street.includes(cityLower) ||
               locationName.includes(cityLower) ||
               attractionName.includes(cityLower) ||
               // Also try partial matches
               cityLower.includes(region) ||
               cityLower.includes(locality);
      });
    }

    // Limit results
    attractions = attractions.slice(0, parseInt(limit));

    // Transform data to consistent format
    const transformedAttractions = attractions.map(attraction => {
      // Extract tags from additionalProperty
      let tags = [];
      if (attraction.additionalProperty) {
        const tagsProperty = attraction.additionalProperty.find(prop => 
          prop.name === 'tags' || prop['@type'] === 'PropertyValue'
        );
        if (tagsProperty && tagsProperty.value) {
          tags = Array.isArray(tagsProperty.value) ? tagsProperty.value : [tagsProperty.value];
          // Clean up tags - remove duplicates and trim whitespace
          tags = [...new Set(tags.map(tag => tag.trim()).filter(tag => tag.length > 0))];
        }
      }

      // Extract address information from the new format
      const addressData = attraction.address?.[0] || attraction.location?.address || {};
      const addressParts = [
        addressData.streetAddress,
        addressData.addressLocality,
        addressData.addressRegion,
        addressData.postalCode,
        addressData.addressCountry
      ].filter(Boolean);
      
      const address = {
        full: addressParts.join(', '),
        street: addressData.streetAddress || '',
        city: addressData.addressLocality || '',
        region: addressData.addressRegion || '',
        postalCode: addressData.postalCode || '',
        country: addressData.addressCountry || ''
      };

      return {
        id: attraction.id || attraction['@id'],
        name: attraction.name,
        description: attraction.description,
        image: attraction.photo?.[0]?.contentUrl || attraction.photo?.contentUrl || null,
        address: address,
        coordinates: {
          latitude: attraction.location?.geo?.latitude,
          longitude: attraction.location?.geo?.longitude
        },
        website: attraction.url,
        telephone: attraction.telephone,
        email: attraction.email,
        openingHours: attraction.openingHours,
        priceRange: attraction.offers?.price ? `€${attraction.offers.price}` : null,
        category: attraction['@type']?.[0] || attraction['@type'] || 'Event',
        rating: attraction.aggregateRating?.ratingValue,
        reviewCount: attraction.aggregateRating?.reviewCount,
        startDate: attraction.startDate,
        endDate: attraction.endDate,
        isAccessibleForFree: attraction.isAccessibleForFree,
        eventSchedule: attraction.eventSchedule,
        tags: tags
      };
    });

    return NextResponse.json({
      success: true,
      count: transformedAttractions.length,
      attractions: transformedAttractions
    });

  } catch (error) {
    console.error("Attractions API Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        attractions: []
      }, 
      { status: 500 }
    );
  }
}
