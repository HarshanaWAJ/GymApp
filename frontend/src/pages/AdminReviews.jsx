import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Avatar,
  Tooltip,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  CircularProgress,
} from '@mui/material';
import { SentimentSatisfied, SentimentVeryDissatisfied, SentimentNeutral } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axios from '../api/axiosInstance';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

function getSentimentType(score) {
  if (score > 0.2) return 'positive';
  if (score < -0.2) return 'negative';
  return 'neutral';
}

function getSentimentIcon(type) {
  switch (type) {
    case 'positive':
      return <SentimentSatisfied sx={{ color: '#4caf50' }} />;
    case 'negative':
      return <SentimentVeryDissatisfied sx={{ color: '#f44336' }} />;
    default:
      return <SentimentNeutral sx={{ color: '#9e9e9e' }} />;
  }
}

const sentimentLabels = {
  all: 'All',
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

function AdminReviews() {
  const sidebarWidth = 10;

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [sortOrder, setSortOrder] = useState('highToLow');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const response = await axios.get('/reviews/');
        const reviewsData = response.data;

        if (!Array.isArray(reviewsData)) {
          console.error('Unexpected data format for reviews:', reviewsData);
          return;
        }

        const trainersMap = {};
        reviewsData.forEach((r) => {
          const t = r.trainerId;
          if (t && t._id && !trainersMap[t._id]) {
            trainersMap[t._id] = { _id: t._id, name: t.name || 'Unknown' };
          }
        });

        const uniqueTrainers = Object.values(trainersMap);

        // Add sentiment
        const reviewsWithSentiment = reviewsData.map((r) => ({
          ...r,
          sentimentScore: sentiment.analyze(r.comment || '').comparative,
          sentimentType: getSentimentType(sentiment.analyze(r.comment || '').comparative),
        }));

        setTrainers(uniqueTrainers);
        setReviews(reviewsWithSentiment);
        setFilteredReviews(reviewsWithSentiment);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    let updated = [...reviews];

    if (selectedTrainer !== 'all') {
      updated = updated.filter(
        (r) => r.trainerId && r.trainerId._id === selectedTrainer
      );
    }

    if (sentimentFilter !== 'all') {
      updated = updated.filter((r) => r.sentimentType === sentimentFilter);
    }

    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      updated = updated.filter(
        (r) =>
          (r.comment || '').toLowerCase().includes(lowerSearch) ||
          (r.clientName || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (sortOrder === 'highToLow') {
      updated.sort((a, b) => b.rating - a.rating);
    } else {
      updated.sort((a, b) => a.rating - b.rating);
    }

    setFilteredReviews(updated);
  }, [selectedTrainer, sortOrder, reviews, sentimentFilter, searchText]);

  return (
    <Box sx={{ display: 'flex' }}>
      <StoreAdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: { sm: `${sidebarWidth}px` },
          backgroundColor: '#fafafa',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Reviews Management
        </Typography>

        <Card sx={{ p: 2, mb: 4, boxShadow: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Trainer</InputLabel>
                <Select
                  value={selectedTrainer}
                  label="Filter by Trainer"
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                >
                  <MenuItem value="all">All Trainers</MenuItem>
                  {trainers.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <ToggleButtonGroup
                value={sentimentFilter}
                exclusive
                onChange={(_, value) => value && setSentimentFilter(value)}
                aria-label="sentiment filter"
                fullWidth
              >
                {Object.entries(sentimentLabels).map(([key, label]) => (
                  <ToggleButton key={key} value={key} aria-label={label}>
                    {key !== 'all' && getSentimentIcon(key)}
                    {` ${label}`}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort by Rating</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sort by Rating"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="highToLow">High to Low</MenuItem>
                  <MenuItem value="lowToHigh">Low to High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search by client or comment"
                variant="outlined"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Grid>
          </Grid>

          {(selectedTrainer !== 'all' || sentimentFilter !== 'all' || searchText) && (
            <Box mt={2} textAlign="right">
              <Button variant="text" color="primary" onClick={() => {
                setSelectedTrainer('all');
                setSentimentFilter('all');
                setSearchText('');
                setSortOrder('highToLow');
              }}>
                Reset Filters
              </Button>
            </Box>
          )}
        </Card>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 10,
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredReviews.length === 0 ? (
          <Typography variant="h6" color="text.secondary" mt={4} align="center">
            No reviews found matching your criteria.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredReviews.map((review) => {
              const sentimentColor =
                review.sentimentType === 'positive'
                  ? '#4caf50'
                  : review.sentimentType === 'negative'
                  ? '#f44336'
                  : '#9e9e9e';

              return (
                <Grid item xs={12} sm={6} md={4} key={review._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 3,
                      borderRadius: 3,
                      cursor: 'default',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: sentimentColor, fontWeight: 'bold' }}>
                          {review.clientName ? review.clientName[0].toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {review.clientName || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.trainerId?.name || 'Unknown Trainer'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: 'pre-wrap', mb: 2, minHeight: 60 }}
                      >
                        {review.comment || <em>No comment provided.</em>}
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Rating
                          value={review.rating || 0}
                          readOnly
                          precision={0.5}
                          size="medium"
                          sx={{
                            color:
                              review.rating >= 4
                                ? '#4caf50'
                                : review.rating <= 2
                                ? '#f44336'
                                : '#ffb400',
                          }}
                        />
                        <Tooltip
                          title={`Sentiment score: ${review.sentimentScore.toFixed(2)}`}
                          placement="top"
                        >
                          <Box sx={{ color: sentimentColor, fontSize: 24 }}>
                            {getSentimentIcon(review.sentimentType)}
                          </Box>
                        </Tooltip>
                      </Stack>

                      <Typography variant="caption" color="text.secondary" fontStyle="italic">
                        {review.createdAt
                          ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
                          : 'Date unknown'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default AdminReviews;
