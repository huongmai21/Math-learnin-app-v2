import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelatedDocuments } from "../../services/documentService";
import "./Document.css";

const RelatedDocuments = ({ currentDoc }) => {
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const universitySubjects = [
    { value: "advanced_math", label: "Toán Nâng Cao" },
    { value: "calculus", label: "Giải Tích" },
    { value: "algebra", label: "Đại Số" },
    { value: "probability_statistics", label: "Xác Suất & Thống Kê" },
    { value: "differential_equations", label: "Phương Trình Vi Phân" },
  ];

  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoading(true);
      try {
        const params = {
          educationLevel: currentDoc.educationLevel,
          excludeId: currentDoc._id,
          limit: 4, // Giới hạn 4 tài liệu
        };
        if (currentDoc.educationLevel === "university") {
          params.subject = currentDoc.subject;
        }
        if (currentDoc.tags?.length > 0) {
          params.tags = currentDoc.tags.join(",");
        }
        const docs = await getRelatedDocuments(params);
        setRelated(docs);
      } catch (error) {
        console.error("Error fetching related documents:", error);
        setRelated([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, [currentDoc]);

  const getSubjectLabel = (subject) => {
    const found = universitySubjects.find((s) => s.value === subject);
    return found ? found.label : "Không xác định";
  };

  return (
    <div className="related-documents">
      <h3 className="related-title">Tài liệu liên quan</h3>
      {isLoading ? (
        <div className="document-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-image"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-description"></div>
            </div>
          ))}
        </div>
      ) : related.length > 0 ? (
        <div className="document-grid">
          {related.map((doc) => (
            <Link
              key={doc._id}
              to={`/documents/${doc._id}`}
              className="document-card"
            >
              <img
                src={doc.thumbnail || "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934624/1_bsngjz.png"}
                alt={doc.title}
                className="document-image"
              />
              <h4 className="document-title">{doc.title}</h4>
              {doc.subject && (
                <p className="document-subject">{getSubjectLabel(doc.subject)}</p>
              )}
              <p className="document-description">
                {doc.description?.slice(0, 80)}...
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-documents">Không có tài liệu liên quan.</p>
      )}
    </div>
  );
};

export default RelatedDocuments;